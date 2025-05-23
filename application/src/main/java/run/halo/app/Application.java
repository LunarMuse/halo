package run.halo.app;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Halo main class.
 *
 * @author ryanwang
 * @author JohnNiang
 * @author guqing
 * @date 2017-11-14
 */
@EnableScheduling
@SpringBootApplication(scanBasePackages = "run.halo.app", exclude =
    IntegrationAutoConfiguration.class)
@ConfigurationPropertiesScan(basePackages = "run.halo.app.infra.properties")
public class Application {

    public static void main(String[] args) {
        new SpringApplicationBuilder(Application.class)
            .applicationStartup(new BufferingApplicationStartup(1024))
            .run(args);
    }

}
