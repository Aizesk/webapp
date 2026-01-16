# ==================================================
# Generic Dockerfile for Aizesk Java Microservices
# ==================================================
# Usage: Copy this file to each microservice directory
# and build with: docker build -t aizesk/<service-name> .
# ==================================================

# ============ BUILD STAGE ============
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better caching
COPY mvnw* ./
COPY .mvn .mvn/
COPY pom.xml ./

# Download dependencies (cached layer)
RUN chmod +x mvnw 2>/dev/null || true
RUN ./mvnw dependency:go-offline -B 2>/dev/null || \
    mvn dependency:go-offline -B 2>/dev/null || \
    echo "Skipping dependency cache"

# Copy source code
COPY src ./src/

# Build the application
RUN ./mvnw clean package -DskipTests -B 2>/dev/null || \
    mvn clean package -DskipTests -B

# ============ RUNTIME STAGE ============
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S aizesk && \
    adduser -u 1001 -S aizesk -G aizesk

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown -R aizesk:aizesk /app

# Switch to non-root user
USER aizesk

# JVM options for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${SERVER_PORT:-8080}/actuator/health || exit 1

# Expose port (overridden by docker-compose)
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
