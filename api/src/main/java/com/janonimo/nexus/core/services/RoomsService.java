package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.models.*;
import com.janonimo.nexus.core.repositories.AmenityRepository;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.RoomRepository;
import com.janonimo.nexus.dto.Month;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.Search;
import com.janonimo.nexus.dto.management.RoomAmenity;
import com.janonimo.nexus.dto.management.RoomDto;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RoomsService {
    private final RequestHandler requestHandler;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final BookingRepository bookingRepository;

    public RoomDto create(RoomDto request) {
        Room room;
        room = Room.builder().type(request.getType())
                .resource(request.getResource())
                .roomStatus(RoomStatus.AVAILABLE).rate(request.getRate()).roomNumber(request.getRoomNumber()).build();
        room = roomRepository.save(room);
        if (room != null) {
            List<Amenity> amenities = amenityRepository.findAll();
            if (amenities != null) {
                for (String a : request.getAmenities()) {
                    for (Amenity amenity : amenities) {
                        if (amenity.getDescription().contentEquals(a)) {
                            room.addAmenity(amenity);
                        }
                    }
                }
                room = roomRepository.save(room);
            }
        }
        return new RoomDto(Objects.requireNonNull(room));
    }

    public RoomDto edit(RoomDto request) {
        if (request.getId() != 0 && request.getId() > 0) {
            Room room = roomRepository.getReferenceById(request.getId());
            if (room != null) {
                if (!request.getType().isEmpty()) {
                    room.setType(request.getType());
                }
                if (request.getAmenities() != null) {
                    if (!request.getAmenities().isEmpty()) {
                        for (String r : request.getAmenities()) {
                            Amenity amenity = amenityRepository.findByName(r).orElse(null);
                            {
                                if (amenity != null) {
                                    room.addAmenity(amenity);
                                }
                            }
                        }
                    }
                }
                if (request.getRoomNumber() != null) {
                    room.setRoomNumber(request.getRoomNumber());
                }
                if (request.getRate() != 0) {
                    room.setRate(request.getRate());
                }
                roomRepository.save(room);
            }
        }
        return new RoomDto(Objects.requireNonNull(roomRepository.getReferenceById(request.getId())));
    }

    public List<RoomDto> rooms() {
        List<Room> rooms = roomRepository.findAll();
        if (rooms != null) {
            for (Room room : rooms) {
                List<Booking> bookings = bookingRepository.byPendingAndCheckin(room.getId());
                if (bookings.isEmpty()) {
                    clearRoom(room);
                } else if (room.getRoomStatus() == RoomStatus.UNAVAILABLE) {
                    if (bookingRepository.byPendingAndCheckin(room.getId()).isEmpty()) {
                        clearRoom(room);
                    }
                }
            }
            rooms = roomRepository.findAll();
        }
        return toResponseList(rooms);
    }

    public boolean delete(String jwt, Reference reference) {
        if (requestHandler.isOwner(jwt)) {
            roomRepository.delete(roomRepository.getReferenceById(reference.getId()));
            return roomRepository.existsById(reference.getId());
        }

        return false;
    }

    private Room reference(int id) {
        return roomRepository.getReferenceById(id);
    }

    public Room room(int id) {
        return reference(id);
    }

    public RoomDto read(int id) {
        Room room = reference(id);
        RoomDto response = null;
        if (room != null) {
            room.setAmenities(amenityRepository.findByRoom(room.getId()));
            response = new RoomDto(room);
        }
        return response;
    }

    public RoomDto roomManagement(Integer id) {
        RoomDto roomDto = read(id);
        roomDto.setOccupant(Objects.requireNonNull(bookingRepository.findByRoom(id).orElse(null)).getGuest().fullName());
        return roomDto;
    }

    public Room getBookingRoom(Booking booking) {
        Room room = roomRepository.findByBooking(booking.getId()).orElse(null);
        if(room != null){
            List<Amenity> amenities = new ArrayList<>();
            List<Amenity> roomAmenities = room.getAmenities();
            for(Amenity amenity : roomAmenities){
                if(booking.getCheckin().isAfter(amenity.getCreated())){
                    amenities.add(amenity);
                }
            }
            room.setAmenities(amenities);
        }
        return room;
    }

    public List<RoomDto> available(Search search) {
        return toResponseList(search(search));
    }


    public List<Room> search(Search search) {
        List<Room> rooms = roomRepository.search(search.getCheckin(), search.getType());
        List<Room> cleanRooms = new ArrayList<>();
        if (!search.getType().isEmpty()) {
            if (rooms != null) {
                for (Room room : rooms) {
                    boolean matchesAll = isRoomAmenitiesMatch(search, room);
                    if (matchesAll) {
                        if (isRoomAvailable(room, search)) {
                            cleanRooms.add(room);
                        }
                    }
                }
            }
        } else {
            return handleEmptyTypeFilter(search);
        }
        return cleanRooms;
    }

    public boolean isRoomAvailable(Room room, Search search) {
        if (room == null || search == null) {
            return false;
        }
        LocalDateTime checkin = search.getCheckin();
        LocalDateTime checkout = search.getCheckout();

        List<Booking> bookings = room.getBookings();
        if (bookings != null) {
            for (Booking booking : bookings) {
                if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.PENDING) {
                    if (search.getBookingId() != null) {
                        int bookingId = Integer.parseInt(search.getBookingId());
                        Booking edit = bookingRepository.getReferenceById(bookingId);
                        if (edit != null) {
                            if (edit.getId() == booking.getId()) {
                                continue;
                            }
                        }
                    }
                    LocalDateTime recCheckin = booking.getCheckin();
                    LocalDateTime recCheckout = booking.getCheckout();
                    boolean isOverlap =
                            (checkin.isBefore(recCheckout) && checkout.isAfter(recCheckin)) ||
                                    (recCheckin.isBefore(checkout) && recCheckout.isAfter(checkin)) ||
                                    (recCheckin.getDayOfYear() == checkout.getDayOfYear());
                    if (isOverlap) {
                        return false;
                    }
                }
            }

        }
        return true;
    }


    public List<Integer> availability(int id, Month month) {
        List<Integer> days = new ArrayList<>();
        Room room = reference(id);

        if (room != null) {
            LocalDate currentDate = LocalDate.of(month.getMonth().getYear(), month.getMonth().getMonthValue(), 1);
            LocalDate lastDayOfMonth = currentDate.withDayOfMonth(currentDate.lengthOfMonth());
            while (!currentDate.isAfter(lastDayOfMonth)) {
                boolean isAvailable = true;
                for (Booking booking : room.getBookings()) {
                    LocalDate checkin = booking.getCheckin().toLocalDate();
                    LocalDate checkout = booking.getCheckout().toLocalDate();
                    if (!currentDate.isBefore(checkin) && !currentDate.isAfter(checkout)) {
                        isAvailable = false;
                        break;
                    }
                }
                if (isAvailable) {
                    days.add(currentDate.getDayOfMonth());
                }
                currentDate = currentDate.plusDays(1);
            }
        }

        return days;
    }


    private boolean isRoomAmenitiesMatch(Search search, Room room) {
        boolean matchesAll = true;
        for (String searchAmenity : search.getAmenities()) {
            boolean isMatch = false;
            for (Amenity amenity : room.getAmenities()) {
                if (searchAmenity.equals(amenity.getDescription())) {
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                matchesAll = false;
                break;
            }
        }
        return matchesAll;
    }

    private List<Room> handleEmptyTypeFilter(Search search) {
        List<Room> cleanRooms = null;
        if (search != null) {
            if (search.getType() != null) {
                if (search.getType().isEmpty()) {
                    List<Room> rooms = roomRepository.search(search.getCheckin());
                    if (rooms != null) {
                        cleanRooms = new ArrayList<>();
                        for (Room room : rooms) {
                            boolean matchesAll = isRoomAmenitiesMatch(search, room);
                            if (matchesAll) {
                                cleanRooms.add(room);
                            }
                        }
                    }
                }
            }
        }
        return cleanRooms;
    }

    private List<RoomDto> toResponseList(List<Room> rooms) {
        List<RoomDto> response = null;
        if (rooms != null && !rooms.isEmpty()) {
            response = new ArrayList<>();
            for (Room room : rooms) {
                RoomDto temp = RoomDto.builder().status(room.getRoomStatus().name())
                        .rate(room.getRate()).type(room.getType())
                        .id(room.getId()).resource(room.getResource()).build();
                List<Amenity> amenities = room.getAmenities();
                if (amenities != null) {
                    if (!amenities.isEmpty()) {
                        temp.assignAmenities(amenities);
                    }
                }
                response.add(temp);
            }
        }
        return response;
    }

    public void upload(int id, MultipartFile file) {
        Room room = roomRepository.getReferenceById(id);
        if (room != null && !file.isEmpty()) {
            final String DIR = "C:/Users/ronni/Documents/MINI PROJECT/web/nexus/public/src/";
            String path = DIR + file.getOriginalFilename();
            try {
                try {
                    if (!new File(path).exists()) {
                        file.transferTo(new File(path));
                    }
                    roomRepository.saveAndFlush(room);
                } catch (FileSizeLimitExceededException e) {
                    System.out.println("File too large");
                }
            } catch (IOException ex) {
                System.out.println("X");
            }
        }
    }

    public void clearRoom(Room room) {
        if (room != null) {
            room.setRoomStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
    }

    public boolean assignRoom(Room room) {
        if (room.getRoomStatus() == RoomStatus.UNAVAILABLE) {
            List<Booking> checkedInBooking = bookingRepository.byPendingAndCheckin(room.getId());
            if (checkedInBooking.isEmpty()) {
                room.setRoomStatus(RoomStatus.AVAILABLE);
                room = roomRepository.save(room);
                assert room != null;
            }
        }
        if (room.getRoomStatus() != RoomStatus.UNAVAILABLE) {
            room.setRoomStatus(RoomStatus.UNAVAILABLE);
            roomRepository.save(room);
        } else {
            return false;
        }
        return true;
    }

    public List<String> types() {
        List<Room> rooms = roomRepository.findAll();
        List<String> response = new ArrayList<>();
        if (rooms != null) {
            for (Room room : rooms) {
                if (!response.contains(room.getType())) {
                    response.add(room.getType());
                }
            }
        }
        return response;
    }

    public boolean addAmenity(RoomAmenity request) {
        if (request != null) {
            if (roomRepository.existsById(request.getRoomId())) {
                Room room = roomRepository.getReferenceById(request.getRoomId());
                if (room != null) {
                    Amenity amenity = amenityRepository.findByName(request.getAmenity()).orElse(null);
                    if (amenity != null) {
                        if (!room.getAmenities().contains(amenity)) {
                            room.addAmenity(amenity);
                            roomRepository.save(room);
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                return false;
            }
        }
        return true;
    }

    public boolean checkRoomNumber(String roomNumber) {
        List<Room> rooms = roomRepository.findAll();
        if (rooms != null) {
            for (Room room : rooms) {
                if (room.getRoomNumber().contentEquals(roomNumber)) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<String> roomNoneAmenities(int id) {
        System.out.print(id);
        return null;
    }

    public boolean removeRoomAmenity(RoomAmenity request) {
        Room room = roomRepository.getReferenceById(request.getRoomId());
        Amenity amenity = amenityRepository.findByName(request.getAmenity()).orElse(null);
        if (room != null && amenity != null) {
            room.getAmenities().remove(amenity);
            roomRepository.save(room);
            return room.getAmenities().contains(amenity);
        }
        return true;
    }
}

