FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a system user for security
RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 spring --ingroup spring
    
COPY target/*.jar app.jar
RUN chown -R spring:spring /app

USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx800m", "-Xms256m", "-jar", "app.jar"]
