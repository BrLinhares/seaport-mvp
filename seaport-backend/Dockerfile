# =============================
# Stage 1: Build
# =============================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apk add --no-cache maven && \
    mvn clean package -DskipTests --no-transfer-progress

# =============================
# Stage 2: Runtime
# =============================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuário não-root por segurança + diretório de uploads com permissão correta
RUN addgroup -S seaport && adduser -S seaport -G seaport && \
    mkdir -p /app/uploads && \
    chown -R seaport:seaport /app

COPY --from=builder /app/target/*.jar app.jar
RUN chown seaport:seaport /app/app.jar

USER seaport

# Health check para Azure
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
