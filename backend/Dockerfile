# Stage 1: Build
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a system user for security
RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 spring --ingroup spring
    
COPY --from=build /app/target/*.jar app.jar
RUN chown -R spring:spring /app

USER spring

EXPOSE 8080
# Limit memory usage for the JVM to avoid OOM
ENTRYPOINT ["java", "-Xmx800m", "-Xms256m", "-jar", "app.jar"]
