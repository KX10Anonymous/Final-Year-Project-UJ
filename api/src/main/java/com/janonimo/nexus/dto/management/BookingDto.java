package com.janonimo.nexus.dto.management;

import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.BookingStatus;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.user.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Builder
@RequiredArgsConstructor
@Data
@AllArgsConstructor
public class BookingDto {
    private Integer id;
    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private LocalDateTime expiration;
    private int roomId;
    private String type;
    private String guest;
    private boolean checkedOut;

    private boolean checkedIn;
    public BookingDto(@NotNull Booking booking){
        if(booking != null){
            this.id = booking.getId();
            this.checkin = booking.getCheckin();
            this.checkout = booking.getCheckout();
            this.expiration = booking.getExpiration();
            this.guest = booking.getGuest().fullName();
            if(booking.getStatus() == BookingStatus.PENDING){
                this.checkedIn = false;
                this.checkedOut = false;
            }else if(booking.getStatus() == BookingStatus.CHECKED_IN){
                this.checkedOut = false;
                this.checkedIn = true;
            }else if(booking.getStatus() == BookingStatus.CHECKED_OUT){
                this.checkedIn = true;
                this.checkedOut = true;
            }
            Room room = booking.getRoom();
            if(room != null){
                this.roomId = room.getId();
                if(booking.getGuest().getRole().getRoleName() != RoleName.GUEST){
                    this.type = room.getType() + " : " + room.getRoomNumber();
                }else{
                    this.type = room.getType();
                }

            }
        }
    }
    public Booking getBooking(){
        Booking booking;
        if(Objects.isNull(id)){
            booking = Booking.builder().checkin(checkin)
                    .checkout(checkout).build();
        }else{
            booking = Booking.builder().id(id).checkin(checkin)
                    .checkout(checkout).build();
        }

        return booking;
    }
}
