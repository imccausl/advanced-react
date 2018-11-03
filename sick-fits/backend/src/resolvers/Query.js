const { forwardTo } = require("prisma-binding")
const { hasPermission } = require("../utils")

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // check if there is a current userID
    if (!ctx.request.userID) {
      return null
    }

    return ctx.db.query.user(
      {
        where: { id: ctx.request.userID },
      },
      info,
    )
  },
  async users(parent, args, ctx, info) {
    // check if user is logged in
    if (!ctx.request.userID) {
      throw new Error("You must be logged in to do this.")
    }

    // check if user has permission to query all users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"])

    // if so, query them
    return ctx.db.query.users({}, info)
  },
}

module.exports = Query
