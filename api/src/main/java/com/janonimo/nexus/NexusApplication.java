package com.janonimo.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class NexusApplication extends SpringBootServletInitializer{

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder){
        return builder.sources(NexusApplication.class);
    }


    public static void main(String[] args) {
        System.setProperty("server.servlet.context-path", "/nexus");
        SpringApplication.run(NexusApplication.class, args);
    }


}
