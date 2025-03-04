import dotenv from 'dotenv'

export const parseEnvFiles  = (pathArr) => {
    dotenv.config({
        path: pathArr
    })
}
