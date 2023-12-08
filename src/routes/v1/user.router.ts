import { Router } from "express";
import { validateRequestBody } from "../../helpers/validateRequest.helper";
import { createUser } from "../../service/user.service";
import { createUserValidator } from "../../validators/user";
const userRouter = Router();

userRouter.post(
  "/",
  validateRequestBody(
   createUserValidator
  ),
  (req, res) => {
    createUser(req.body);
  }
);

export default userRouter;
