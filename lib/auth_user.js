/* Copyright (c) 2012-2020 Richard Rodger and other contributors, MIT License. */
'use strict'

module.exports = (ctx) => {
  // const intern = ctx.intern

  return async function auth_user(msg) {
    var seneca = this

    var token = msg.token

    // TODO: should this be just `fields`
    // all login fields are loaded anyway, so can only apply to user
    var user_fields = msg.user_fields || []

    console.log('auth_user', token)
    try {
      // Verify the token with Kinde
      const login = await kinde.verifyAccessToken(token);
      
      if (!login || !login.active) {
        return {
          ok: false,
          token: token,
          why: login ? 'login-inactive' : 'login-not-found',
        };
      }
  
      // Extract user_id from login
      const user_id = login.user_id || login.user;
      const user_query = {
        id: user_id,
        fields$: [...new Set(ctx.standard_user_fields.concat(user_fields))],
      };
  
      // Assuming you still need to load user details from your sys_user entity
      const user = await seneca.entity(ctx.sys_user).load$(user_query);
  
      if (null == user) {
        return {
          ok: false,
          token: token,
          login_id: login.id,
          why: 'user-not-found',
        };
      }
  
      return {
        ok: true,
        user: user,
        login: login,
      };
  
    } catch (error) {
      // Handle errors from the Kinde API
      console.error('Error verifying token with Kinde:', error);
      return {
        ok: false,
        token: token,
        why: 'token-verification-failed',
      };
    }

}//end of auth_user
