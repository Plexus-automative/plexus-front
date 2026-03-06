package com.plexus.backend.service;

public class NumberToWordsConverter {
    private static final String[] tensNames = {
            "", " DIX", " VINGT", " TRENTE", " QUARANTE", " CINQUANTE",
            " SOIXANTE", " SOIXANTE-DIX", " QUATRE-VINGT", " QUATRE-VINGT-DIX"
    };

    private static final String[] numNames = {
            "", " UN", " DEUX", " TROIS", " QUATRE", " CINQ", " SIX", " SEPT", " HUIT", " NEUF",
            " DIX", " ONZE", " DOUZE", " TREIZE", " QUATORZE", " QUINZE", " SEIZE", " DIX-SEPT", " DIX-HUIT",
            " DIX-NEUF"
    };

    private static String convertLessThanOneThousand(int number) {
        String soFar;
        if (number % 100 < 20) {
            soFar = numNames[number % 100];
            number /= 100;
        } else {
            soFar = numNames[number % 10];
            number /= 10;
            soFar = tensNames[number % 10] + soFar;
            number /= 10;
        }
        if (number == 0)
            return soFar;
        return numNames[number] + " CENT" + soFar;
    }

    public static String convert(long number) {
        if (number == 0) {
            return "ZÉRO";
        }
        String snumber = Long.toString(number);
        String mask = "000000000000".substring(snumber.length()) + snumber;
        int billions = Integer.parseInt(mask.substring(0, 3));
        int millions = Integer.parseInt(mask.substring(3, 6));
        int hundredThousands = Integer.parseInt(mask.substring(6, 9));
        int thousands = Integer.parseInt(mask.substring(9, 12));

        String tradBillions;
        switch (billions) {
            case 0:
                tradBillions = "";
                break;
            case 1:
                tradBillions = convertLessThanOneThousand(billions) + " MILLIARD ";
                break;
            default:
                tradBillions = convertLessThanOneThousand(billions) + " MILLIARDS ";
        }
        String result = tradBillions;

        String tradMillions;
        switch (millions) {
            case 0:
                tradMillions = "";
                break;
            case 1:
                tradMillions = convertLessThanOneThousand(millions) + " MILLION ";
                break;
            default:
                tradMillions = convertLessThanOneThousand(millions) + " MILLIONS ";
        }
        result = result + tradMillions;

        String tradHundredThousands;
        switch (hundredThousands) {
            case 0:
                tradHundredThousands = "";
                break;
            case 1:
                tradHundredThousands = "MILLE ";
                break;
            default:
                tradHundredThousands = convertLessThanOneThousand(hundredThousands) + " MILLE ";
        }
        result = result + tradHundredThousands;

        String tradThousand;
        tradThousand = convertLessThanOneThousand(thousands);
        result = result + tradThousand;

        return result.replaceAll("^\\s+", "").replaceAll("\\b\\s{2,}\\b", " ").trim();
    }
}
