// import middy from "@middy/core";
// import {ApiGatewayEventBody, ApiGatewayResponse} from "src/lib/http";
// import {v4} from "uuid";
// import {command} from "src/components/article/index";
//
//
// export const registerUserHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
//     const id = event.body.id || v4();
//     const result = await command.create(id, event.body.article);
// }
