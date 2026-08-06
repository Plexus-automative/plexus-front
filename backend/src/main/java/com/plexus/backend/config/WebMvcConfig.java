package com.plexus.backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Wires the journal d'activité interceptor onto every API route. */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * Registered explicitly (rather than as a {@code @Component}) so the order is known:
     * it must wrap the request before the controller consumes the body, and it runs after
     * the Spring Security chain so unauthenticated calls are never buffered.
     */
    @Bean
    public FilterRegistrationBean<ActivityLogCachingFilter> activityLogCachingFilter() {
        FilterRegistrationBean<ActivityLogCachingFilter> registration = new FilterRegistrationBean<>(
                new ActivityLogCachingFilter());
        registration.addUrlPatterns("/api/*");
        registration.setOrder(Ordered.LOWEST_PRECEDENCE - 10);
        return registration;
    }

    private final ActivityLogInterceptor activityLogInterceptor;

    public WebMvcConfig(ActivityLogInterceptor activityLogInterceptor) {
        this.activityLogInterceptor = activityLogInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(activityLogInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/activity-log/**");
    }
}
