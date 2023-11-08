package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.communication.Notification;
import com.janonimo.nexus.core.communication.ReceiptStatus;
import com.janonimo.nexus.core.communication.services.NotificationsService;
import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.models.billing.InvoiceStatus;
import com.janonimo.nexus.core.models.billing.PaymentStatus;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.InvoiceRepository;
import com.janonimo.nexus.dto.management.billing.InvoiceDto;
import com.janonimo.nexus.dto.management.billing.ItemDto;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ReservationService {
    private final AmenityService amenityService;
    private final NotificationsService notificationsService;
    private final InvoiceRepository invoiceRepository;
    private final RoomsService roomsService;
    private final BookingRepository bookingRepository;
    private final RequestHandler requestHandler;

    public void create(Booking booking) {
        if (booking != null) {
            Notification notification = Notification.builder().created(LocalDateTime.now())
                    .user(booking.getGuest()).message("Welcome, enjoy your " + booking.getRoom().getType())
                    .receiptStatus(ReceiptStatus.UNREAD).build();
            notificationsService.create(notification);
        }
    }

    public void edit(Booking booking) {
        if (booking != null) {
            Invoice invoice;
            invoice = booking.getNewInvoice();
            invoice = invoiceRepository.save(invoice);
            if (invoice != null) {
                booking.setInvoice(invoice);
                booking = bookingRepository.save(booking);
                if (booking != null) {
                    if (booking.getRoom() != null) {
                        try {
                            roomsService.clearRoom(booking.getRoom());
                            String message = "Your Invoice Is Ready, Your Outstanding Balance is R" + invoice.getTotalAmount();
                            Notification notification = Notification.builder().created(LocalDateTime.now()).receiptStatus(ReceiptStatus.UNREAD)
                                    .message(message).user(booking.getGuest()).build();
                            if (notification != null) {
                                notificationsService.create(notification);
                            }
                        } catch (Exception e) {
                            System.out.println("WARNING IN EDIT");
                        }
                    }
                }
            }
        }
    }

    public InvoiceDto invoice(int id) {
        InvoiceDto invoiceDto = null;
        if (bookingRepository.existsById(id)) {
            Booking booking = bookingRepository.getReferenceById(id);
            if (booking != null) {
                Invoice invoice = invoiceRepository.findByBooking(booking.getId()).orElse(null);
                if (invoice != null) {
                    invoiceDto = new InvoiceDto(invoice);
                    invoice.setStatus(InvoiceStatus.APPROVED);
                    invoice = invoiceRepository.save(invoice);
                    if (invoice != null) {
                        invoiceDto.setDays(booking.getDays());
                        Room room = roomsService.getBookingRoom(booking);
                        if (room != null) {
                            invoiceDto.setItems(items(room));
                        }
                    }
                }
            }
        }
        return invoiceDto;
    }

    public List<InvoiceDto> readUserInvoices(String jwt) {
        List<InvoiceDto> dtos = null;
        if (requestHandler.isGuest(jwt)) {
            User user = requestHandler.getUser(jwt);
            if (user != null) {
                dtos = new ArrayList<>();
                List<Invoice> invoices = invoiceRepository.findByUser(user.getId());
                for (Invoice invoice : invoices) {
                    InvoiceDto dto = new InvoiceDto(invoice);
                    Booking booking = invoice.getReservation();
                    Room room = roomsService.getBookingRoom(booking);
                    dto.setDays(invoice.getReservation().getDays());
                    if (room != null) {
                        dto.setItems(items(room));
                    }
                    dtos.add(dto);
                }
            }
        } else if (requestHandler.isClerk(jwt)) {
            dtos = toDtoList(invoiceRepository.unpaid());
        } else if (requestHandler.isOwner(jwt) || requestHandler.isManager(jwt)) {
            dtos = toDtoList(invoiceRepository.paid());
        }
        return dtos;
    }

    private List<ItemDto> items(Room room) {
        List<ItemDto> itemDtos = new ArrayList<>();
        List<Amenity> amenities = room.getAmenities();
        ItemDto it = new ItemDto();
        it.setName(room.getType() + " Room");

        it.setRate(room.getRate());
        itemDtos.add(it);
        if (amenities != null) {
            for (Amenity amenity : amenities) {
                itemDtos.add(new ItemDto(amenity));
            }
        }
        return itemDtos;
    }



    private List<InvoiceDto> toDtoList(List<Invoice> invoices) {
        List<InvoiceDto> dtos = null;
        if (invoices != null) {
            for (Invoice invoice : invoices) {
                dtos = new ArrayList<>();
                dtos.add(new InvoiceDto(invoice));
            }
        }
        return dtos;
    }

    public void pay(int id, String jwt) {
        User user = requestHandler.getUser(jwt);
        if (user != null) {
            Invoice invoice = invoiceRepository.pay(user.getId(), id).orElse(null);
            if (invoice != null) {
                invoice.setPayment(PaymentStatus.PAID);
                invoiceRepository.save(invoice);
            }
        }
    }

    public String generateInvoicePdf(int id) {
        Invoice invoice = invoiceRepository.getReferenceById(id);
        PDDocument document = new PDDocument();

        if (invoice != null) {

            Booking reservation = invoice.getReservation();
            Room room = reservation.getRoom();
            User guest = reservation.getGuest();
            List<Amenity> amenities = room.getAmenities();
            if (guest == null || amenities == null) {
                return "";
            }
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDDocumentInformation information = new PDDocumentInformation();
            information.setAuthor("Nexus Management");
            information.setProducer("Nexus Management");
            information.setTitle(guest.fullName() + reservation.getId());

            document.setDocumentInformation(information);
            String folderName = "C:/Users/ronni/Documents/MINI PROJECT/api/src/main/resources/invoices/";
            File file = new File(folderName + information.getTitle() + ".pdf");
            boolean isDeleted = true;
            if(file.exists()){
                isDeleted = file.delete();
            }
            if (!file.exists() || isDeleted) {

                try (FileOutputStream fileOutputStream = new FileOutputStream(file)) {
                    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    PDPageContentStream contentStream = new PDPageContentStream(document, page);
                    float margin = 50;
                    float yPosition = page.getMediaBox().getHeight() - margin;
                    float rowHeight = 20f;

                    File logoFile = new File("C:/Users/ronni/Documents/MINI PROJECT/api/src/main/resources/utilities/logo.png");
                    if (logoFile.exists()) {
                        try {
                            PDImageXObject logo = PDImageXObject.createFromFile(logoFile.getAbsolutePath(), document);
                            float width = 100;
                            float height = 100;
                            float logoX = 10;
                            float logoY = page.getMediaBox().getHeight() - margin - height;
                            contentStream.drawImage(logo, logoX, logoY, width, height);
                        } catch (IOException e) {
                            System.out.println("Image Not Found <===> ");
                        }
                    }

                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 14);
                    contentStream.beginText();
                    yPosition -= 7 * rowHeight;
                    contentStream.newLineAtOffset(margin, yPosition);


                    Date created = Date.from(invoice.getCreated().atZone(ZoneId.systemDefault()).toInstant());
                    contentStream.showText("INVOICE: #" + invoice.getInvoiceNumber() + "             Created:" + dateFormat.format(created));
                    contentStream.endText();
                    yPosition -= 1 * rowHeight;

                    //Write Guest Name
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 14);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Guest: " + guest.fullName());
                    contentStream.endText();
                    yPosition -= 2 * rowHeight;


                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);

                    //Write Check in Date
                    Date checkinDate = Date.from(reservation.getCheckin().atZone(ZoneId.systemDefault()).toInstant());
                    contentStream.showText("Check In Date  " + dateFormat.format(checkinDate));
                    contentStream.endText();
                    yPosition -= rowHeight;

                    //Write Checkout Date
                    Date checkoutDate = Date.from(reservation.getCheckout().atZone(ZoneId.systemDefault()).toInstant());
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Check Out Date " + dateFormat.format(checkoutDate));
                    contentStream.endText();
                    yPosition -= 2 * rowHeight;

                    double totalAmenitiesAmount = 0.0;

                    //Write Room Rate Times Days
                    yPosition -= 50f;
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(room.getType());
                    contentStream.newLineAtOffset(180, 0);
                    contentStream.showText("                R " + room.getRate() + "  *  " + reservation.getDays());
                    contentStream.endText();
                    yPosition -= rowHeight;

                    //Write Amenities
                    for (Amenity amenity : amenities) {
                        if(!reservation.getCheckin().isAfter(amenity.getCreated())){
                            continue;
                        }
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText(amenity.getDescription());
                        contentStream.newLineAtOffset(180, 0);
                        contentStream.showText("                R" + amenity.getRate() + "  *  " + reservation.getDays());
                        contentStream.endText();
                        yPosition -= rowHeight;
                        totalAmenitiesAmount += amenity.getRate();
                    }

                    //Set VAT Amount
                    yPosition -= rowHeight;
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("VAT (15%)");
                    contentStream.newLineAtOffset(180, 0);
                    contentStream.showText("                R" + Double.valueOf(invoice.getVat()).intValue() + ".00");
                    contentStream.endText();
                    yPosition -= rowHeight;

                    //Set Net Amount
                    yPosition -= rowHeight;
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("NET ");
                    contentStream.newLineAtOffset(180, 0);
                    contentStream.showText("                R" + Double.valueOf(invoice.getNet()).intValue() + ".00");
                    contentStream.endText();

                    //Set Total Amount
                    yPosition -= rowHeight;
                    double totalAmount = room.getRate() + totalAmenitiesAmount;
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD_OBLIQUE), 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Total Amount                               R" + totalAmount * reservation.getDays());
                    contentStream.endText();
                    contentStream.close();

                    document.save(fileOutputStream);
                    document.close();

                    //Save Printable PDF in folder
                    if (new File(folderName + information.getTitle() + ".pdf").exists()) {
                        invoice.setDownload(information.getTitle() + ".pdf");
                        invoice.setPayment(PaymentStatus.PAID);
                        invoiceRepository.save(invoice);

                        //Create Notification
                        Notification notification = new Notification();
                        notification.setUser(guest);
                        notification.setMessage("Your Printable Invoice Is Ready For Download.");
                        notification.setCreated(LocalDateTime.now());
                        notification.setReceiptStatus(ReceiptStatus.UNREAD);
                        notificationsService.create(notification);
                        return information.getTitle() + ".pdf";
                    }
                } catch (IOException e) {
                    System.out.println(e.getMessage());
                }
            } else {
                System.out.println(file.getAbsolutePath() + " Already Exists");
            }
        }
        return "Not Created";
    }


}
