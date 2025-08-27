import React from "react";
import Input from "../components/inputs/input";
import { useForm } from "react-hook-form";

export default function ContactUs() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm();

    const onSubmit = (data) => {
        // Here you would typically send data to your backend or an email service
        alert("Thank you for contacting us! We will get back to you soon.");
        reset();
        console.log(data);
    };

    return (
        <section className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center bg-gray-50 py-12 px-4 md:px-16">
            {/* Contact Info */}
            <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h2>
                <p className="mb-6 text-gray-700">
                    Have questions, feedback, or need support? Fill out the form and our team will respond promptly. You can also reach us directly:
                </p>
                <ul className="mb-6 text-gray-600">
                    <li className="mb-2"><span className="font-semibold">Email:</span> <a href="mailto:info@school.com" className="text-blue-600 hover:underline">info@school.com</a></li>
                    <li className="mb-2"><span className="font-semibold">Phone:</span> <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a></li>
                    <li><span className="font-semibold">Address:</span> 123 School Lane, City, Country</li>
                </ul>
                <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="text-blue-600 hover:text-blue-800"><i className="fab fa-facebook fa-lg"></i></a>
                    <a href="#" aria-label="Twitter" className="text-blue-400 hover:text-blue-600"><i className="fab fa-twitter fa-lg"></i></a>
                    <a href="#" aria-label="LinkedIn" className="text-blue-700 hover:text-blue-900"><i className="fab fa-linkedin fa-lg"></i></a>
                </div>
            </div>

            {/* Contact Form */}
            <form
                className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-8"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Send us a message</h3>
                <Input
                    type="text"
                    label="Full Name"
                    name="fullName"
                    placeholder="Enter your full name"
                    register={register}
                    className="mb-4"
                />
                {errors.fullName && (
                    <span className="text-red-500 text-xs mb-2">Full name is required.</span>
                )}
                <Input
                    type="email"
                    label="Email"
                    name="email"
                    placeholder="Enter your email"
                    register={register}
                    className="mb-4"
                />
                {errors.email && (
                    <span className="text-red-500 text-xs mb-2">Valid email is required.</span>
                )}
                <div className="mb-4 flex flex-col">
                    <label htmlFor="message" className="mb-2 text-sm font-bold text-blue-500 uppercase">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Enter your message"
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                        {...register("message", { required: true })}
                    />
                    {errors.message && (
                        <span className="text-red-500 text-xs">Message is required.</span>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                {isSubmitSuccessful && (
                    <div className="mt-4 text-green-600 font-medium">Your message has been sent!</div>
                )}
            </form>
        </section>
    );
}