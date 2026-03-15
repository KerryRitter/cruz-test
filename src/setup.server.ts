import "reflect-metadata";
import * as schema from "./database/schema";
import { DrizzleService } from "@cruzjs/core/shared/database/drizzle.service";

DrizzleService.setSchema(schema);
