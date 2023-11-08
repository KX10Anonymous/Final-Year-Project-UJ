package com.janonimo.nexus.util;

import java.security.SecureRandom;


public class StringRandomizer {
    private final char []arr = {'A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L',
            'M', 'N', 'N', 'O', 'P', 'Q',
            'R', 'S', 'T', 'U', 'W', 'X',
            'Y', 'Z','1', '2', '3', '4', '5', '6',
            '7', '8', '9' };

    public String getLetters(int bound){
        StringBuilder builder = new StringBuilder();
        byte []seed  = {1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 14, 15, 16, 17, 18, 19, 20
        ,21, 22,23,24,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40};
        SecureRandom secureRandom = new SecureRandom(seed);
        for(int r = 1; r <= bound; r++){
            int index = secureRandom.nextInt(0, 35);
            char c = arr[index];
            builder.append(c);
        }
        return builder.toString();
    }
}
