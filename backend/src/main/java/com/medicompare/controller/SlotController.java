package com.medicompare.controller;

import com.medicompare.entity.AppointmentSlot;
import com.medicompare.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @GetMapping
    public List<AppointmentSlot> available(@RequestParam Long doctorId,
                                            @RequestParam LocalDate date) {
        return slotService.availableSlots(doctorId, date);
    }
}
