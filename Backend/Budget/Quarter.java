package org.mm.FinanceTracker.Budget;

public enum Quarter {
    Q1("Q1"),
    Q2("Q2"),
    Q3("Q3"),
    Q4("Q4");

    private final String value;

    Quarter(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Quarter fromString(String value) {
        for (Quarter quarter : Quarter.values()) {
            if (quarter.value.equalsIgnoreCase(value)) {
                return quarter;
            }
        }
        throw new IllegalArgumentException("Invalid quarter value: " + value);
    }
}
