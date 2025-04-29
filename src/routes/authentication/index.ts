import {Hono} from "hono";
import { LogInWithUsernameAndPasswordError, signUpWithUsernameAndPasswordError } from "./types";
import { signUpWithUsernameAndPassword, logInWithUsernameAndPassword } from "./controllers";

export const authenticationRoutes = new Hono();


// Signs up a user (leverages JWT)
authenticationRoutes.post("/sign-in",async(context)=>{
    const {username, password} = await context.req.json();
    try {
        const result = await signUpWithUsernameAndPassword({
          username,
          password,
        });
    
        return context.json(
          {
            data: result,
          },
          201
        );
      } catch (e) {
        if (e === signUpWithUsernameAndPasswordError.CONFLICTING_USERNAME) {
          return context.json(
            {
              message: "Username already exists",
            },
            409
          );
        }
    
        return context.json(
          {
            mesage: "Unknown",
          },
          500
        );
      }
    });


    // Logs in a user (leverages JWT)
    authenticationRoutes.post("/log-in", async(context) => {
      try{
        const{username, password} = await context.req.json();

        const result = await logInWithUsernameAndPassword({
          username,
          password,
        });
        return context.json({
          data: result,
        });


      }catch(e){
        if( e === LogInWithUsernameAndPasswordError.INCORRECT_USERNAME_OR_PASSWORD){
          return context.json(
            {
              message:"incorrect username or password",
            },
            401
          );
        }

        if( e === LogInWithUsernameAndPasswordError.UNKOWN){
          return context.json(
            {
              message :"unknown",
            },
            500
          );
        }
        
      }
    });