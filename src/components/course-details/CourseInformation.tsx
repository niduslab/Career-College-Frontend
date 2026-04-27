import React from "react";
import Image from "next/image";
import { Video, Clock, BarChart3, Award, Radio } from "lucide-react";
import image from "@/assets/images/courses-details/image.webp";

export default function CourseInformation() {
  const [selectedOption, setSelectedOption] = React.useState("one-time");

  return (
    <div className="rounded-2xl bg-white shadow-lg p-6">
      <div className="mb-4">
        <Image
          src={image}
          alt="Course Cover"
          width={320}
          height={176}
          className="w-full h-44 object-cover rounded-xl"
        />
      </div>
      <h3 className="font-bold text-lg mb-4">Course Information</h3>
      <ul className="space-y-3 text-sm text-(--gray-700) mb-6">
        <li className="flex items-center gap-2">
          <Video size={18} className="text-(--gray-500)" /> Total 92 Videos
        </li>
        <li className="flex items-center gap-2">
          <Clock size={18} className="text-(--gray-500)" /> Duration 10 hours 45 min
        </li>
        <li className="flex items-center gap-2">
          <BarChart3 size={18} className="text-(--gray-500)" /> Intermediate Level
        </li>
        <li className="flex items-center gap-2">
          <Award size={18} className="text-(--gray-500)" /> Get Certificate
        </li>
      </ul>

      {/* Purchase Options */}
      <div className="space-y-3 mb-6">
        {/* One time option */}
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--gray-50) cursor-pointer">
          <input
            type="radio"
            id="one-time"
            name="purchase"
            checked={selectedOption === "one-time"}
            onChange={() => setSelectedOption("one-time")}
            className="w-4 h-4"
          />
          <label htmlFor="one-time" className="flex-1 font-medium text-sm cursor-pointer">
            One time for 1-person
          </label>
          <span className="font-bold text-sm">$42.99</span>
        </div>

        {/* Subscriptions header */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-(--gray-50)">
          <Radio size={18} className="text-(--primary-600)" />
          <label className="font-semibold text-sm">Subscriptions</label>
        </div>

        {/* Subscription options */}
        <div className="space-y-2 pl-8">
          <div className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              id="starter"
              name="subscription"
              checked={selectedOption === "starter"}
              onChange={() => setSelectedOption("starter")}
              className="w-4 h-4"
            />
            <label htmlFor="starter" className="flex-1 font-medium text-sm cursor-pointer">
              Starter
            </label>
            <span className="text-sm">
              <span className="font-bold">$42.99</span>
              <span className="text-(--gray-500) text-xs ml-1">/year</span>
            </span>
          </div>

          <div className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              id="growth"
              name="subscription"
              checked={selectedOption === "growth"}
              onChange={() => setSelectedOption("growth")}
              className="w-4 h-4"
            />
            <label htmlFor="growth" className="flex-1 font-medium text-sm cursor-pointer">
              Growth
            </label>
            <span className="text-sm">
              <span className="font-bold">$242.99</span>
              <span className="text-(--gray-500) text-xs ml-1">/year</span>
            </span>
          </div>

          <div className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              id="ultimate"
              name="subscription"
              checked={selectedOption === "ultimate"}
              onChange={() => setSelectedOption("ultimate")}
              className="w-4 h-4"
            />
            <label htmlFor="ultimate" className="flex-1 font-medium text-sm cursor-pointer">
              Ultimate
            </label>
            <span className="text-sm">
              <span className="font-bold">$499.00</span>
              <span className="text-(--gray-500) text-xs ml-1">/year</span>
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        {selectedOption === "one-time" ? (
          <button className="w-full bg-(--primary-600) text-white font-semibold py-3 rounded-md hover:bg-(--primary-700) transition">
            Add to Cart
          </button>
        ) : (
          <button className="w-full bg-(--primary-600) text-white font-semibold py-3 rounded-md hover:bg-(--primary-700) transition">
            Subscribe Now
          </button>
        )}
        <button className="w-full bg-(--gray-100) text-(--primary-700) font-semibold py-3 rounded-md hover:bg-(--gray-200) transition">
          Membership
        </button>
      </div>
    </div>
  );
}
