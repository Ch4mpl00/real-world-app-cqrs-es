import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { App } from '../composition/root';

export const initPassport = (app: App) => {
  passport.use(new LocalStrategy(
    (username, password, done) => {

    }
  ));
}

