package com.medicompare.util;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

public final class InvoiceNumberGenerator {
    private static final AtomicLong SEQ = new AtomicLong(1000);

    private InvoiceNumberGenerator() {}

    public static String next() {
        return "MC-INV-" + Year.now().getValue() + "-" + SEQ.incrementAndGet();
    }
}
