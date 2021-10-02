import { resolve } from 'path';
import mongooseType from 'mongoose';
import type * as expressType from 'express';
import type * as passportTypes from 'passport';
import { clearDatabase, connectToDatabase } from './mongo';

// use jest types
export const loadCommonRequireMock = (jest: Record<any, any>, testConfig: Record<any, any>): void => {
    const config = {
        ...testConfig,
        default: testConfig,
        loadConfig: () => Promise.resolve(testConfig),
    };
    jest.mock(resolve(process.cwd(), 'src/base-config'), () => (config));
    jest.mock(resolve(process.cwd(), 'src/config'), () => (config));
    jest.mock(resolve(process.cwd(), 'src/services/analytics/analytics'), () => ({
        track: jest.fn(),
    }));
    jest.mock(resolve(process.cwd(), 'src/services/logger'), () => ({
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn()
    }));
    jest.mock(resolve(process.cwd(), 'src/services/customerio-service/customerio-transactional-service'), () => ({
        inviteCollaboratorEmail: jest.fn(),
    }));
};

export const mockMiddleware = (req: expressType.Request, res: expressType.Response, next: expressType.NextFunction): void => {
    next();
};

// use jest types
export const mockServerModules = ({ jest, mongoose, passport }: { jest: Record<any, any>, mongoose: typeof mongooseType, passport: typeof passportTypes}): void => {
    jest.mock('source-map-support', () => ({
        install: jest.fn()
    }));
    jest.mock('aws-sdk', () => ({
        SharedIniFileCredentials: jest.fn(),
        S3: jest.fn().mockImplementation(),
        config: {
            credentials: {},
            update: jest.fn(),
        },
    }));

    jest.mock('@sentry/node', () => ({
        init: jest.fn(),
        Handlers: {
            requestHandler: () => mockMiddleware,
            errorHandler: () => mockMiddleware,
        },
    }));

    const morgan = () => mockMiddleware;
    morgan['token'] = () => 'foo';
    jest.mock('morgan', () => morgan);
    jest.mock(resolve(process.cwd(),'src/models/init-mongo'), () => {
        return {
            mongooseConnection: mongoose.connection,
        };
    });

    jest.mock(resolve(process.cwd(), 'src/services/auth-service/passport-init'), () => passport);
    jest.mock(resolve(process.cwd(), 'src/services/deploy-services/container-orchestration-service'), () => ({
        initializeContainerEnvironments: jest.fn(),
    }));

    jest.mock(resolve(process.cwd(), 'src/services/services'), () => ({
        init: async () => {
            await connectToDatabase(mongoose);
            await clearDatabase(mongoose);
        },
    }));
};

