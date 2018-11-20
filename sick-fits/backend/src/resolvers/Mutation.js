const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { randomBytes } = require("crypto")
const { promisify } = require("util")

const { transport, makeANiceEmail } = require("../mail")
const { hasPermission } = require("../utils")

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userID) {
      throw new Error("You must be logged in to add items!")
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // this is how we create a relationship between
          // the item and the user.
          user: {
            connect: {
              id: ctx.request.userID,
            },
          },
          ...args,
        },
      },
      info,
    )

    return item
  },

  updateItem(parent, args, ctx, info) {
    // take a copy of the updates
    const updates = { ...args }

    // remove the ID from the updates
    delete updates.id

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id },
      },
      info,
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }

    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`)

    // 2. check if owner or if user has proper permissions
    const ownsItem = item.user.id === ctx.request.userID
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission),
    )

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to delete this item")
    }

    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()

    // hash the password
    const password = await bcrypt.hash(args.password, 10)

    // create the user in the DB
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] },
        },
      },
      info,
    )

    // create JWT token for newly created user
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET)
    // Set a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 356, // One year
    })

    // Return user to the browser
    return user
  },
  async signin(parent, { password, email }, ctx, info) {
    // 1. check if there is a user w/ that email
    const user = await ctx.db.query.user({ where: { email } })

    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    // 2. check if their password is correct
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error("Invalid password")
    }

    // 3. generate a JWT token
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET)

    // 4. set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })

    // 5. return the user
    return user
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token")
    return { message: "Goodbye!" }
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } })

    if (!user) {
      throw new Error(`No user with email ${args.email}`)
    }

    // 2. Set reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })
    // 3. Email them the reset token
    const mailRes = await transport.sendMail({
      from: "imccausl@gmail.com",
      to: user.email,
      subject: "SICK-FITS Password Reset Request",
      html: makeANiceEmail(`
      A password reset was recently requested on your account. 
      In order to reset your password, please click on the link below:
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click here to reset your password!</a>
      `),
    })

    return { message: "Thanks!" }
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    const { password, confirmPassword, resetToken } = args

    if (password !== confirmPassword) {
      throw new Error("Can't reset password: passwords don't match")
    }

    // 2. Check if its a legit reset token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    })

    if (!user) {
      throw new Error("This token is either invalid or expired")
    }

    // 3. Hash new password
    const newPassword = await bcrypt.hash(password, 10)

    // 4. Save new password to user, and remove old resetToken field
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // 5. Generate JWT
    const token = jwt.sign({ userID: updatedUser.id }, process.env.APP_SECRET)

    // 6. Set the JWT cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 356, // One year
    })

    // 7. Return the new user
    return updatedUser
  },

  async updatePermissions(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userID) {
      throw new Error("You must be logged in to do this")
    }

    // check if they have the correct update permissions... permission
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"])

    // update permissions in the db
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: { id: args.userId },
      },
      info,
    )
  },

  async addToCart(parent, args, ctx, info) {
    // check if user is signed in
    const { userID } = ctx.request

    if (!userID) {
      throw new Error("You must be signed in to do this")
    }

    // query the user's current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userID },
        item: { id: args.id },
      },
    })

    // check if the item is already in the cart and if so, increment by one
    if (existingCartItem) {
      console.log("This item is already in the cart")
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info,
      )
    }
    // if item not in cart create a fresh cart item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userID } },
          item: { connect: { id: args.id } },
        },
      },
      info,
    )
  },
}

module.exports = Mutations
