import mongoose from "mongoose";

export async function connect() {
  try {
    mongoose.connect(
      `${process.env.MONDODB_URL}/${process.env.MONGODB_DB_NAME}`
    );
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.log(
        "❌ MongoDB connection error. Please make sure MongoDB is running. " +
          err
      );
      process.exit();
    });
  } catch (error) {
    console.log(
      "❌ Something went wrong while connecting to the database",
      error
    );
  }
}
