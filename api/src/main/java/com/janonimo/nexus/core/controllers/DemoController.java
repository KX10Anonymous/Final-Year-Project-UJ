package com.janonimo.nexus.core.controllers;


import com.github.javafaker.Faker;
import com.janonimo.nexus.core.models.*;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.models.billing.InvoiceStatus;
import com.janonimo.nexus.core.models.billing.PaymentStatus;
import com.janonimo.nexus.core.repositories.AmenityRepository;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.InvoiceRepository;
import com.janonimo.nexus.core.repositories.RoomRepository;
import com.janonimo.nexus.user.LockStatus;
import com.janonimo.nexus.user.Role;
import com.janonimo.nexus.user.RoleName;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.user.services.RoleRepository;
import com.janonimo.nexus.user.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Random;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {
    private final UserService userService;
    private final  byte []seed  = {1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 14, 15, 16, 17, 18, 19, 20
            ,21, 22,23,24,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,50,49,48,47,46,45,44,43,42,41,
            51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
            81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99};
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final AmenityRepository amenityRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;

    public void rooms() {
        amenities();
        for (int r = 0; r < 20; r++) {
            Room room = new Room();
            room.setRoomStatus(RoomStatus.AVAILABLE);
            int num = new SecureRandom(seed).nextInt(1, 7+1);

            if (num == 2) {
                room.setType("Executive Suite");
                room.setRate(700);
                room.setRoomNumber("ES0" + r);
                room.setResource("1.jpg");
            } else if (num == 3) {
                room.setType("Royal Suite");
                room.setRate(800);
                room.setResource("2.jpg");
                room.setRoomNumber("RS0" + r);
            } else if (num == 1) {
                room.setType("Junior Suite");
                room.setRate(150);
                room.setResource("3.jpg");
                room.setRoomNumber("JS0" + r);
            } else if (num == 4) {
                room.setType("Standard Suite");
                room.setRate(200);
                room.setRoomNumber("SS0" + r);
                room.setResource("4.jpg");
            } else if (num == 5) {
                room.setRate(350);
                room.setType("Standard Double Bed");
                room.setResource("5.jpg");
                room.setRoomNumber("SD0" + r);
            } else if (num == 6) {
                room.setRate(350);
                room.setType("Presidential Suite");
                room.setResource("1.jpg");
                room.setRoomNumber("SD0" + r);
            }else {
                room.setRate(250);
                room.setType("Apartment");
                room.setResource("6.jpg");
                room.setRoomNumber("AS0" + r);
            }

            room = roomRepository.save(room);
            if (room != null) {
                List<Amenity> amenities = amenityRepository.findAll();
                assert amenities != null;
                SecureRandom random = new SecureRandom(seed);
                for (int c = 0; c < 3; c++) {
                    int position = random.nextInt(0, amenities.size() - 1);
                    if (amenities.get(position) != null) {
                        Amenity amenity = amenities.get(position);
                        if (room.getAmenities() != null) {
                            if (!room.getAmenities().contains(amenity)) {
                                room.addAmenity(amenity);
                            }
                        } else {
                            room.addAmenity(amenity);
                        }
                    }
                }
                roomRepository.save(room);
                amenityRepository.saveAllAndFlush(amenities);
            }
        }
    }

    private void roles() {
        Role r1 = Role.builder().roleName(RoleName.OWNER).build();
        roleRepository.save(r1);
        Role r2 = Role.builder().roleName(RoleName.MANAGER).build();
        roleRepository.save(r2);
        Role r3 = Role.builder().roleName(RoleName.CLERK).build();
        roleRepository.save(r3);
        Role r4 = Role.builder().roleName(RoleName.GUEST).build();
        roleRepository.save(r4);
    }

    public void bookings() {
        List<User> guests = userService.guests();
        List<Room> rooms = roomRepository.findAll();
        if (!guests.isEmpty()) {
            assert rooms != null;
            if (!rooms.isEmpty()) {
                for (User guest : guests) {
                    int sc = new SecureRandom().nextInt(1, 2+1);
                    if (sc == 1) {
                        continue;
                    }
                    int position = new Random(LocalDateTime.now().getNano()).nextInt(1, 20);
                    Room room = rooms.get(position);
                    if (room != null) {
                        Booking booking = getBooking(guest, room);
                        bookingRepository.save(booking);
                    }

                }
            }
        }
    }

    private static Booking getBooking(User guest, Room room) {
        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setGuest(guest);
        byte []seed  = {1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 14, 15, 16, 17, 18, 19, 20
                ,21, 22,23,24,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,50,49,48,47,46,45,44,43,42,41,
                51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
                81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99};
        SecureRandom rand = new SecureRandom(seed);
        int month = rand.nextInt(10, 11 + 1);
        int day;
        int oDay;
        if (month == 10) {
            day = rand.nextInt(26, 31);
            oDay = rand.nextInt(day, 31);
        } else {
            day = rand.nextInt(1, 30);
            oDay = rand.nextInt(day, 30);
        }
        int hour = rand.nextInt(1, 24);

        int min = rand.nextInt(1, 59);
        booking.setCheckin(LocalDateTime.of(2023, month, day, hour, min));
        min = rand.nextInt(1, 59);
        booking.setCheckout(LocalDateTime.of(2023, month, oDay, 23, min));
        booking.setStatus(BookingStatus.PENDING);
        booking.setExpiration(LocalDateTime.of(2023, month, day, hour, min));
        return booking;
    }

    public void archive() {
        List<User> guests = userService.guests();
        List<Room> rooms = roomRepository.findAll();
        if (guests != null) {
            if (rooms != null) {
                for (User guest : guests) {
                    SecureRandom bookingsRand = new SecureRandom(seed);
                    int floor = bookingsRand.nextInt(1, 11);
                    int ceil = bookingsRand.nextInt(floor, 13);

                    SecureRandom secureRandom = new SecureRandom(seed);
                    Random rand = new Random(secureRandom.nextInt());
                    int userBase = rand.nextInt(1, 28);
                    for (int c = floor; c <= ceil; c++) {
                        for (int y = 2022; y <= 2023; y++) {
                            if (y == 2023) {
                                if (c >= 10) {
                                    continue;
                                }
                            }
                            int position = new SecureRandom(seed).nextInt(0,rooms.size());
                            Room room = rooms.get(position);
                            if (room != null) {
                                Booking tempBooking = new Booking();
                                tempBooking.setRoom(room);
                                tempBooking.setGuest(guest);

                                int hour = rand.nextInt(1, 11);

                                if (userBase >= 28 || (userBase + 3) >= 29) {
                                    userBase = userBase - 10;
                                }

                                rand = new Random(secureRandom.nextInt());
                                int min = rand.nextInt(1, 59);
                                tempBooking.setCheckin(LocalDateTime.of(y, c, userBase, hour, min));
                                rand = new Random(secureRandom.nextInt());
                                userBase = rand.nextInt(userBase, 28);
                                rand = new Random(secureRandom.nextInt());
                                min = rand.nextInt(1, 59);
                                tempBooking.setCheckout(LocalDateTime.of(y, c, userBase, 23, min));
                                tempBooking.setStatus(BookingStatus.CHECKED_OUT);
                                tempBooking.setExpiration(tempBooking.getCheckin());
                                reservation(tempBooking);
                            }
                        }
                    }
                }
            }
        }

    }

    private void reservation(Booking booking) {
        if (booking != null) {
            booking = bookingRepository.save(booking);
            if (booking != null) {
                Invoice invoice = booking.getNewInvoice();
                invoice.setCreated(booking.getCheckout());
                invoice.setStatus(InvoiceStatus.APPROVED);
                invoice.setPayment(PaymentStatus.PAID);
                invoice = invoiceRepository.save(invoice);
                booking.setInvoice(invoice);
                bookingRepository.save(booking);
            }
        }
    }

    private void amenities() {
        LocalDateTime time = LocalDateTime.of(2021, 1, 1,1,1);
        Amenity a1 = Amenity.builder().rate(50).description("Room Service").created(time).build();
        amenityRepository.saveAndFlush(a1);
        a1 = Amenity.builder().rate(5).description("Wi-Fi").created(time).build();
        amenityRepository.saveAndFlush(a1);
        a1 = Amenity.builder().rate(35).description("Valet Parking").created(time).build();
        amenityRepository.saveAndFlush(a1);
        a1 = Amenity.builder().rate(12).description("Swimming Pool").created(time).build();
        amenityRepository.saveAndFlush(a1);
        a1 = Amenity.builder().rate(5).description("Television").created(time).build();
        amenityRepository.saveAndFlush(a1);
        a1 = Amenity.builder().rate(7).description("Coffee Station").created(time).build();
        amenityRepository.saveAndFlush(a1);
    }

    private void runRoles() {
        roles();
    }

    public void addUsers() {
        for (int r = 0; r < 50; r++) {
            Faker faker = new Faker(new Random(100 + r + 1));
            User user = new User();
            String firstname = faker.name().firstName();
            String lastname = faker.name().lastName();
            user.setFirstname(firstname);
            user.setLastname(lastname);
            user.setLockStatus(LockStatus.ACTIVE);
            user.setPassword(passwordEncoder.encode("Nyadzani@0"));
            user.setStamp(LocalDateTime.now());
            Role role = roleRepository.findGuest().orElse(null);
            user.setRole(role);
            SecureRandom phonerandom = new SecureRandom(seed);
            user.setEmail((firstname + lastname).toLowerCase().trim() + "@gmail.com");
            user.setPhone("064" + phonerandom.nextInt(1000000, 1988888));
            user = userService.save(user);
            userService.save(user);
        }

    }

    @GetMapping("/owner")
    public ResponseEntity<?> owner() {
        runRoles();
        User user = new User();
        user.setFirstname("Ronnie");
        user.setLockStatus(LockStatus.ACTIVE);
        user.setLastname("Mamidza");
        user.setStamp(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode("Nyadzani@0"));
        Role r1 = Objects.requireNonNull(roleRepository.findOwner().orElse(null));
        user.setRole(r1);
        SecureRandom phonerandom = new SecureRandom(seed);
        user.setEmail("mamidzaronnie@gmail.com");
        user.setPhone("062"+phonerandom.nextInt(2222222, 9999999));
        userService.save(user);
        clerk();
        manager();
        addUsers();
        rooms();
        bookings();
        archive();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public void clerk() {
        User user = new User();
        user.setFirstname("Lambani");
        user.setLastname("Mudau");
        user.setStamp(LocalDateTime.now());
        user.setLockStatus(LockStatus.ACTIVE);
        user.setPassword(passwordEncoder.encode("Nyadzani@0"));
        Role r1 = Objects.requireNonNull(roleRepository.findClerk().orElse(null));
        user.setRole(r1);
        SecureRandom phonerandom = new SecureRandom(seed);
        user.setEmail("clerk@nexus.com");
        user.setPhone("061"+phonerandom.nextInt(2349763, 8928878));
        userService.save(user);

    }


    public void manager() {
        User user = new User();
        user.setFirstname("Kim");
        user.setLastname("Khoza");
        user.setStamp(LocalDateTime.now());
        user.setLockStatus(LockStatus.ACTIVE);
        user.setPassword(passwordEncoder.encode("Nyadzani@0"));
        Role r1 = Objects.requireNonNull(roleRepository.findManager().orElse(null));
        user.setRole(r1);
        SecureRandom phonerandom = new SecureRandom();
        user.setEmail("manager@nexus.com");
        user.setPhone("065"+phonerandom.nextInt(4456780, 6928888));
        userService.save(user);
    }
}
