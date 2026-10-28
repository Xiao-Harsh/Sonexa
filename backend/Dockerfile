# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8000 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["sh", "-c", "java -Xms128m -Xmx256m -Xss512k -XX:+UseSerialGC -Dserver.port=${PORT:-8000} -Djava.security.egd=file:/dev/./urandom -Djava.net.preferIPv4Stack=true -jar app.jar"]
