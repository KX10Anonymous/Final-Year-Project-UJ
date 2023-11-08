package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.communication.Notification;
import com.janonimo.nexus.core.communication.ReceiptStatus;
import com.janonimo.nexus.core.communication.services.NotificationsService;
import com.janonimo.nexus.core.models.*;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.Search;
import com.janonimo.nexus.dto.management.BookingDto;
import com.janonimo.nexus.user.User;

import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class
BookingService {
    private final BookingRepository bookingRepository;
    private final RoomsService roomsService;
    private final RequestHandler requestHandler;
    private final NotificationsService notificationsService;
    private final ReservationService reservationService;


    public Booking read(int id) {
        if (bookingRepository.existsById(id)) {
            return bookingRepository.getReferenceById(id);
        } else {
            return null;
        }
    }

    public BookingDto create(String jwt, BookingDto request) {

        if (request.getCheckin().isAfter(request.getCheckout())) {
            return null;
        }

        Booking booking = request.getBooking();
        if (booking == null) {
            return null;
        }

        Room room = roomsService.room(request.getRoomId());
        if (room == null) {
            return null;
        }

        ZoneId tZone = ZoneId.of("Africa/Johannesburg");
        LocalDateTime now = LocalDateTime.now(tZone);
        LocalDateTime checkin = request.getCheckin();
        if (checkin.getDayOfYear() == now.getDayOfYear()) {
            checkin = checkin.withHour(23).withMinute(59).withSecond(59).atZone(tZone).toLocalDateTime();
        } else {
            checkin = checkin.withHour(now.getHour()).withMinute(59).withSecond(59).atZone(tZone).toLocalDateTime();
        }
        LocalDateTime checkout = request.getCheckout();
        checkout = checkout.withHour(23).withMinute(59).withSecond(59).atZone(tZone).toLocalDateTime();

        LocalDateTime expiration = checkin;
        if (checkin.getDayOfYear() + 1 <= 365) {
            expiration = expiration.withDayOfYear(checkin.getDayOfYear() + 1).withHour(4).withMinute(59).withSecond(59);
        } else {
            expiration = expiration.withYear(checkin.getYear() + 1).withDayOfYear(1).withHour(4).withMinute(59).withSecond(59);
        }
        booking.setExpiration(expiration);

        Search search = Search.builder().checkin(checkin)
                .checkout(checkout).build();
        if (!roomsService.isRoomAvailable(room, search)) {
            return handleBookingConflict(jwt, request);
        }
        booking.setGuest(requestHandler.getLoggedUserInstance(jwt));
        booking.setCheckin(checkin);
        booking.setCheckout(checkout);
        booking.setStatus(BookingStatus.PENDING);
        booking.setRoom(room);
        booking = bookingRepository.save(booking);

        String message = "Your booking has been received.";
        Notification notification = Notification.builder().created(LocalDateTime.now()).user(requestHandler.getLoggedUserInstance(jwt))
                .message(message).receiptStatus(ReceiptStatus.UNREAD).build();
        notificationsService.create(notification);

        assert booking != null;
        return new BookingDto(booking);
    }


    public BookingDto edit(BookingDto request) {
        Booking booking = bookingRepository.getReferenceById(request.getId());
        if (booking == null) {
            return null;
        }

        if (request.getCheckin().isAfter(request.getCheckout())) {
            return null;
        }

        if (!Objects.equals(booking.getCheckout(), request.getCheckout())) {
            booking.setCheckout(request.getCheckout());
        }
        if (!Objects.equals(booking.getCheckin(), request.getCheckin())) {
            booking.setCheckin(request.getCheckin());
        }

        LocalDateTime expiration = booking.getCheckin();
        if (booking.getCheckin().getDayOfYear() + 1 <= 365) {
            expiration = expiration.withDayOfYear(booking.getCheckin().getDayOfYear() + 1).withHour(4).withMinute(59).withSecond(59);
        } else {
            expiration = expiration.withYear(booking.getCheckin().getYear() + 1).withDayOfYear(1).withHour(4).withMinute(59).withSecond(59);
        }
        booking.setExpiration(expiration);

        booking = bookingRepository.save(booking);

        if(booking != null){
            User guest = booking.getGuest();
            Notification notification = Notification.builder().created(LocalDateTime.now())
                    .message("You have changed you booking dates.")
                    .receiptStatus(ReceiptStatus.UNREAD).user(guest).build();
            notificationsService.create(notification);
            return new BookingDto(booking);
        }
       return null;
    }

    public BookingDto handleBookingConflict(String jwt, BookingDto dto) {
        if (dto != null) {
            Room room = roomsService.room(dto.getRoomId());
            if (room != null) {
                List<Amenity> amenities = room.getAmenities();
                if (amenities != null) {
                    Search search = new Search(amenities, dto.getCheckin(), dto.getCheckout(), room.getType());
                    List<Room> rooms = roomsService.search(search);

                    if (rooms != null && !rooms.isEmpty()) {
                        dto.setRoomId(rooms.get(0).getId());
                        return create(jwt, dto);
                    }
                }
            }
        }
        return null;
    }

    public boolean hasBooking(int bookingId) {
        if (bookingRepository.existsById(bookingId)) {
            Booking booking = bookingRepository.getReferenceById(bookingId);
            if (booking != null) {
                User user = booking.getGuest();
                if (user != null) {
                    List<Booking> bookings = user.getBookings();
                    for (Booking temp : bookings) {
                        if (temp.getStatus() == BookingStatus.CHECKED_IN) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    public double conversionRate() {
        List<Booking> bookings = bookingRepository.findAll();
        if (bookings == null) {
            return 0.0;
        }

        if (bookings.isEmpty()) {
            return 0.0;
        }

        int totalBookings = bookings.size();
        int checkins = 0;

        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
                checkins++;
            }
        }
        return (double) checkins / totalBookings * 100.0;
    }

    public boolean delete(String jwt, Reference reference) {
        Booking booking = bookingRepository.getReferenceById(reference.getId());
        if (requestHandler.isClerk(jwt) ||
                Objects.equals(Objects.requireNonNull(booking).getGuest().getId(), requestHandler.getLoggedUserInstance(jwt).getId())) {
            if (bookingRepository.existsById(reference.getId())) {
                bookingRepository.delete(bookingRepository.getReferenceById(reference.getId()));
            }
        }
        return bookingRepository.existsById(reference.getId());
    }

    public List<BookingDto> getBookings() {
        List<Booking> bookings = bookingRepository.findPending();
        List<BookingDto> response = null;
        if (bookings != null) {
            List<Booking> expired = new ArrayList<>();
            response = new ArrayList<>();
            for (Booking booking : bookings) {
                if (booking.getExpiration().isBefore(LocalDateTime.now())) {
                    booking.setStatus(BookingStatus.EXPIRED);
                    expired.add(booking);
                } else {
                    BookingDto dto = new BookingDto(booking);
                    response.add(dto);
                }
            }
            if (!expired.isEmpty()) {
                bookingRepository.saveAllAndFlush(expired);
            }
        }
        return response;
    }

    public List<BookingDto> userBookings(String jwt) {
        User user = requestHandler.getUser(jwt);
        List<BookingDto> response = null;
        List<Booking> bookings = bookingRepository.userBookings(user.getId());
        if (bookings != null) {
            List<Booking> expired = new ArrayList<>();
            response = new ArrayList<>();
            for (Booking booking : bookings) {
                if(booking.getExpiration() != null){
                    if (booking.getExpiration().isBefore(LocalDateTime.now())) {
                        booking.setStatus(BookingStatus.EXPIRED);
                        expired.add(booking);
                    } else {
                        BookingDto dto = new BookingDto(booking);
                        response.add(dto);
                    }
                }
            }
            if (!expired.isEmpty()) {
                bookingRepository.saveAllAndFlush(expired);
            }
        }
        return response;
    }

    public List<BookingDto> roomBookings(int id) {

        List<BookingDto> bookingsResp = null;
        List<Booking> bookings = bookingRepository.findPendingRoomBookings(id);
        if (bookings != null) {
            bookingsResp = new ArrayList<>();
            for (Booking booking : bookings) {
                BookingDto dto = new BookingDto(booking);
                bookingsResp.add(dto);
            }
        }
        return bookingsResp;
    }

    public boolean isBookingDateArrived(int id) {
        Booking booking = bookingRepository.getReferenceById(id);
        if (booking != null) {
            LocalDateTime checkin = booking.getCheckin();
            LocalDateTime expiration = booking.getExpiration();
            if (checkin != null) {
                return (checkin.getDayOfMonth() == LocalDateTime.now().getDayOfMonth() ||
                        expiration.getDayOfMonth() == LocalDateTime.now().getDayOfMonth()) &&
                        (checkin.getDayOfYear() == LocalDateTime.now().getDayOfYear() ||
                                expiration.getDayOfYear() == LocalDateTime.now().getDayOfYear())
                        && (checkin.getYear() == LocalDateTime.now().getYear() ||
                        expiration.getYear() == LocalDateTime.now().getYear())
                        && (checkin.getMonth().name().contentEquals(LocalDateTime.now().getMonth().name()) ||
                        expiration.getMonth().name().contentEquals(LocalDateTime.now().getMonth().name()))
                        && booking.getExpiration().isAfter(LocalDateTime.now());
            }
        }
        return false;
    }

    public BookingDto checkin(Reference reference) {
        if (reference != null) {
            Booking booking = bookingRepository.getReferenceById(reference.getId());
            if (booking != null) {
                Room room = booking.getRoom();
                if (room != null) {
                    boolean isAssigned = roomsService.assignRoom(room);
                    if (isAssigned) {
                        if (room.getRoomStatus() == RoomStatus.UNAVAILABLE) {
                            booking.setStatus(BookingStatus.CHECKED_IN);
                            booking.setCheckin(LocalDateTime.now());
                            booking = bookingRepository.save(booking);
                            if (booking != null) {
                                if (booking.getStatus() == BookingStatus.CHECKED_IN) {
                                    reservationService.create(booking);
                                    return new BookingDto(booking);
                                }
                            } else {
                                roomsService.clearRoom(room);
                            }
                        }
                    } else {
                        return handleFilledRoom(booking);
                    }
                }
            }
        }
        return null;
    }

    public BookingDto handleFilledRoom(Booking booking) {
        if (booking != null) {
            Room originalRoom = booking.getRoom();
            if (originalRoom != null) {
                List<Amenity> amenities = originalRoom.getAmenities();
                if (amenities != null) {
                    Search search = new Search(amenities, booking.getCheckin(), booking.getCheckout(), originalRoom.getType());
                    List<Room> availableRooms = roomsService.search(search);
                    if (!availableRooms.isEmpty()) {
                        for (Room availableRoom : availableRooms) {
                            if (availableRoom.getRoomStatus() != RoomStatus.UNAVAILABLE) {
                                if (booking != null) {
                                    booking.setRoom(availableRoom);
                                    booking = bookingRepository.save(booking);
                                    if (booking != null) {
                                        Reference reference = Reference.builder().id(booking.getId()).build();
                                        return checkin(reference);
                                    }
                                }

                            }
                        }
                    }

                }
            }
        }
        return null;
    }

    public BookingDto checkout(Reference reference) {
        if (reference != null) {
            Booking booking = bookingRepository.getReferenceById(reference.getId());
            if (booking != null) {
                booking.setStatus(BookingStatus.CHECKED_OUT);
                booking = bookingRepository.save(booking);
                if (booking != null) {
                    if (LocalDateTime.now().isBefore(booking.getCheckout())) {
                        booking.setCheckout(LocalDateTime.now());
                        bookingRepository.save(booking);
                    }
                    roomsService.clearRoom(booking.getRoom());
                    reservationService.edit(booking);
                    User guest = booking.getGuest();

                    Notification notification = Notification.builder().created(LocalDateTime.now())
                            .message("We hope you enjoyed your stay.")
                            .receiptStatus(ReceiptStatus.UNREAD).user(guest).build();
                    notificationsService.create(notification);
                    return new BookingDto(booking);
                }
            }
        }
        return null;
    }

    public Booking findByInvoice(int invoiceId) {
        return bookingRepository.findByInvoice(invoiceId).orElse(null);
    }
}
