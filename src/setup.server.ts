import "reflect-metadata";

import { DrizzleService } from "@cruzjs/core/shared/database/drizzle.service";
import { setUserProviders } from "@cruzjs/core/framework/application.server";
import type { ServiceProvider } from "@cruzjs/core/framework/service-provider";
import * as schema from "@/database/schema";
import { StartProvider } from "@cruzjs/start/start.provider";

DrizzleService.setSchema(schema);

export const userProviders: ServiceProvider[] = [new StartProvider()];

setUserProviders(() => userProviders);
