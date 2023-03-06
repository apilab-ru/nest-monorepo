import { PassportModule } from "@nestjs/passport";

export const AppPassportModule = PassportModule.register({ defaultStrategy: 'bearer' });
