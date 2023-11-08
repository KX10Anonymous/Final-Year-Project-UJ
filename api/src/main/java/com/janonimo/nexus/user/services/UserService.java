package com.janonimo.nexus.user.services;

import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.BookingStatus;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.RoomRepository;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.Search;
import com.janonimo.nexus.dto.management.GuestDto;
import com.janonimo.nexus.dto.user.ProfileInformationResponse;
import com.janonimo.nexus.dto.user.RegisterRequest;
import com.janonimo.nexus.dto.user.StaffDto;
import com.janonimo.nexus.user.*;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * @author JANONIMO
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final RequestHandler requestHandler;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final StaffRepository staffRepository;

    public User save(User user) {
        return repository.save(user);
    }

    public boolean emailExists(String email) {
        return repository.findByEmail(email).isPresent();
    }

    public boolean phoneExists(String phone) {
        return repository.findByPhone(phone).isPresent();
    }

    public ProfileInformationResponse profile(String jwt) {
        User user = requestHandler.getLoggedUserInstance(jwt);
        AtomicReference<ProfileInformationResponse> profile = new AtomicReference<>(ProfileInformationResponse.
                builder().phone(user.getPhone())
                .firstname(user.getFirstname()).email(user.getEmail())
                .role(user.getRole().getRoleName().name())
                .surname(user.getLastname())
                .build());
        return profile.get();
    }


    public List<GuestDto> checkedInGuests() {
        List<GuestDto> response;
        List<User> users = repository.findCheckedInGuests();
        response = toCurrentGuestDtoList(users);
        return response;
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }

    public List<User> guests() {
        return repository.findGuests();
    }

    private List<GuestDto> toCurrentGuestDtoList(List<User> users) {
        List<GuestDto> response = null;
        if (users != null) {
            response = new ArrayList<>();
            try {
                for (User user : users) {
                    GuestDto guestDto = GuestDto.builder().guest(user.fullName()).build();
                    try {
                        Booking guestBooking = bookingRepository.userBooking(user.getId()).orElse(null);
                        if (guestBooking != null) {
                            Room room = roomRepository.findByBooking(guestBooking.getId()).orElse(null);
                            if (room != null) {
                                guestDto.setId(user.getId());
                                guestDto.setType(room.getType());
                                guestDto.setRoomNumber(String.valueOf(room.getRoomNumber()));
                                guestDto.setBookingId(guestBooking.getId());
                                guestDto.setCheckout(guestBooking.getCheckout());
                                response.add(guestDto);
                            }
                        }
                    } catch (IncorrectResultSizeDataAccessException e) {
                        List<Booking> bookings = bookingRepository.inBookings();
                        if (bookings != null) {
                            response = new ArrayList<>();
                            for (Booking booking : bookings) {
                                User u = booking.getGuest();
                                Room room = booking.getRoom();
                                if (room != null) {
                                    GuestDto dto = GuestDto.builder().guest(u.fullName())
                                            .bookingId(booking.getId())
                                            .checkout(booking.getCheckout()).type(room.getType())
                                            .id(u.getId())
                                            .roomNumber(String.valueOf(room.getRoomNumber())).build();
                                    response.add(dto);
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("CANCEL WARNING");
            }
        }
        return response;
    }

    public List<GuestDto> toGuestDtoList() {
        List<User> users = guests();
        List<GuestDto> response = null;
        if (users != null) {
            response = new ArrayList<>();
            try {
                for (User user : users) {
                    GuestDto guestDto = GuestDto.builder().guest(user.fullName())
                            .email(user.getEmail())
                            .id(user.getId())
                            .phone(user.getPhone()).build();
                    if(user.getLockStatus() != null){
                        guestDto.setStatus(user.getLockStatus());
                    }
                    try {
                        int visits = bookingRepository.visits(user.getId()).size();
                        guestDto.setVisits(visits);

                    } catch (IncorrectResultSizeDataAccessException e) {
                       System.out.println("Error Reading Size ");
                    }
                    response.add(guestDto);
                }
            } catch (Exception e) {
                System.out.println("CANCEL WARNING");
            }
        }
        return response;
    }

    public Boolean register(RegisterRequest request) {

        if (request != null) {
            int count = 0;
            Role role = null;
            if ("CLERK".equals(request.getRole())) {
                role = roleRepository.findClerk().orElse(null);
                count = repository.clerks().size();
            } else if ("MANAGER".equals(request.getRole())) {
                role = roleRepository.findManager().orElse(null);
                count = repository.managers().size();
            }
            if (role != null) {
                String email = role.getRoleName().name().toLowerCase() + count + "@nexus.com";
                String password = request.getFirstname() + "@0";
                String phone = request.getPhone();
                User user = User.builder()
                        .firstname(request.getFirstname())
                        .lastname(request.getLastname())
                        .email(email)
                        .phone(phone)
                        .password(passwordEncoder.encode(password))
                        .lockStatus(LockStatus.ACTIVE)
                        .role(role)
                        .build();
                user = repository.save(user);
                if (user != null) {
                    Staff staff = Staff.builder()
                            .user(user)
                            .email(request.getEmail())
                            .build();
                    staff = staffRepository.save(staff);
                    if(staff != null){
                        request.setEmail(email);
                    }
                }
            }
        }
        assert request != null;
        return emailExists(request.getEmail());
    }

    public Boolean delete(Reference reference) {
        if (repository.existsById(reference.getId())) {
            User user = repository.getReferenceById(reference.getId());
            if (user != null) {
                if (user.getRole().getRoleName() != RoleName.OWNER) {
                    user.setLockStatus(LockStatus.LOCKED);
                    user = repository.save(user);
                    return user == null;
                }
            }
        }
        return true;
    }

    public double conversionRate() {
        List<User> users = repository.findAll();

        if(users != null){
            if (users.isEmpty()) {
                return 0.0;
            }
            int totalRegistrations = users.size();
            int successfulBookings = 0;

            for (User user : users) {
                List<Booking> bookings = user.getBookings();
                if(bookings != null){
                    if (!user.getBookings().isEmpty()) {
                        successfulBookings++;
                    }
                }
            }
            return (double) successfulBookings / totalRegistrations * 100.0;
        }
        return 0.0;
    }

    public boolean bookingConflict(String jwt, Search search) {
        LocalDateTime checkin = search.getCheckin();
        LocalDateTime checkout = search.getCheckout();
        User user = requestHandler.getUser(jwt);
        if(user != null){
            List<Booking> bookings = user.getBookings();
            if (bookings != null) {
                for (Booking booking : bookings) {
                    if(booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CHECKED_IN){
                        LocalDateTime recCheckin = booking.getCheckin();
                        LocalDateTime recCheckout = booking.getCheckout();
                        boolean isOverlap =
                                (checkin.isBefore(recCheckout) && checkout.isAfter(recCheckin)) ||
                                        (recCheckin.isBefore(checkout) && recCheckout.isAfter(checkin)) ||
                                        (recCheckin.isEqual(checkin) || recCheckout.isEqual(checkout));
                        System.out.println("HAS BOOKING");
                        if (isOverlap) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public List<StaffDto> staff(){
        List<User> users = repository.staff();
        List<StaffDto> response = null;
        if(users != null){
            response = new ArrayList<>();
            for(User user : users){
                StaffDto dto = StaffDto.builder().id(user.getId())
                        .email(user.getEmail()).fullname(user.fullName())
                        .role(user.getRole().getRoleName().name()).access(user.getStamp()).phone(user.getPhone())
                        .build();
                response.add(dto);
            }
        }
        return response;
    }

    public boolean deactivate(int id){
        User user = repository.getReferenceById(id);
        if(user != null){
            if(user.getLockStatus() != LockStatus.LOCKED){
                user.setLockStatus(LockStatus.LOCKED);
                user = repository.save(user);
                if(user != null){
                    return user.getLockStatus() == LockStatus.LOCKED;
                }
            }
        }
        return false;
    }

    public boolean activate(int id){
        User user = repository.getReferenceById(id);
        if(user != null){
            if(user.getLockStatus() == LockStatus.LOCKED){
                user.setLockStatus(LockStatus.ACTIVE);
                user = repository.save(user);
                if(user != null){
                    return user.getLockStatus() == LockStatus.ACTIVE;
                }
            }
        }
        return false;
    }
}
