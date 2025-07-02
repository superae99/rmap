"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Partner_1 = require("../models/Partner");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const environment_1 = require("./environment");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: environment_1.config.database.host,
    port: environment_1.config.database.port,
    username: environment_1.config.database.username,
    password: environment_1.config.database.password,
    database: environment_1.config.database.database,
    synchronize: environment_1.config.database.synchronize,
    logging: environment_1.config.database.logging,
    entities: [User_1.User, Partner_1.Partner, Area_1.Area, SalesTerritory_1.SalesTerritory],
    migrations: ['src/migrations/*.ts'],
    subscribers: [],
});
//# sourceMappingURL=database.js.map