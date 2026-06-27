import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const getAuthEmail = async (clerkId, auth) => {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    return normalize(
      clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        "",
    );
  } catch (error) {
    const claims = auth?.sessionClaims || {};
    return normalize(
      claims.email ||
        claims.email_address ||
        claims.primaryEmailAddress ||
        claims.primary_email_address ||
        claims.emailAddress ||
        claims.emailAddresses?.[0]?.emailAddress ||
        claims.emailAddresses?.[0]?.email_address ||
        "",
    );
  }
};

const extractAuthName = (auth) => {
  const claims = auth?.sessionClaims || {};
  return (
    `${claims.first_name || claims.firstName || ""} ${claims.last_name || claims.lastName || ""}`
      .trim() ||
    "Admin"
  );
};

const extractAuthImage = (auth) => {
  const claims = auth?.sessionClaims || {};
  return claims.image_url || claims.picture || "";
};

export const adminAuth = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth?.userId;

      if (!clerkId) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const adminEmail = normalize(ENV.ADMIN_EMAIL || "provelt.administrator@gmail.com");
      const authEmail = await getAuthEmail(clerkId, auth);
      const isAdminEmail = authEmail === adminEmail;

      let user = await User.findOne({ clerkId });

      if (isAdminEmail) {
        if (!user) {
          user = await User.create({
            clerkId,
            email: authEmail || adminEmail,
            name: extractAuthName(auth),
            profileImage: extractAuthImage(auth),
            role: "admin",
          });
        } else {
          user.email = authEmail || adminEmail;
          user.role = "admin";
          if (!user.name) {
            user.name = extractAuthName(auth);
          }
          if (!user.profileImage) {
            user.profileImage = extractAuthImage(auth);
          }
          await user.save();
        }

        req.user = user;
        return next();
      }

      if (!user) {
        return res.status(404).json({ msg: "User Not Found" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ msg: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in adminAuth middleware", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },
];