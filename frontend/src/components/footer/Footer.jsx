import React from "react";
import FadeInOnScroll from "../fadein/FadeInOnScroll";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Phone } from "lucide-react";

const Footer = () => {

  const latitude = 11.3405174;
  const longitude = 77.7188919;
  const mapUrl = "https://www.google.com/maps?q=11.3405916,77.7189318"; // Coordinates for the location


  const addresses = [
    {
      street: "No.423, Brough Road, near Savitha Bus Stop",
      city: "Erode 638001",
      hours: "Mon-Sun: 9AM-10PM",
    },
    {
      street: "No.218, near Crocs Showroom, opp to Sales Tax Office",
      city: "Erode 638001",
      hours: "Mon-Sun: 9AM-10PM",
    },
    {
      street: "No.117, Old Bus Stand Road, near Green Trends",
      city: "Perundurai 638052",
      hours: "Mon-Sun: 9AM-10PM",
    },
  ];

  return (
    <FadeInOnScroll threshold={0.1}>
      <footer className="px-4 pt-28 bg-gradient-to-b from-rose-50 to-white">
        <div className="container flex flex-col justify-between py-10 mx-auto space-y-8 lg:block lg:space-x-2">
          {/* Logo and Tagline */}
          <div className="lg:w-1/4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/logo.png"
                alt="OnlyBaby"
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 text-rose-600 font-light">
              Creating magical moments for your little ones
            </p>
          </div>

          {/* Main Sections */}
          <div className="block gap-8 lg:w-full space-y-6 ">
            {/* Store Locations */}
            <div className="space-y-4 lg:w-full">
              <h3 className="text-lg font-semibold tracking-wider text-rose-700 uppercase">
                Visit Us
              </h3>
              <div className=" md:flex items-center justify-center gap-4 space-y-3 pr-4 ">
                {addresses.map((address, index) => (
                  <div
                    key={index}
                    className="p-4  rounded-lg h-full bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-rose-500 "
                  >
                    <p className="font-medium text-rose-800">
                      {address.street}, {address.city}
                    </p>
                    <p className="text-sm text-rose-500 mt-2">
                      {address.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>

              {/*Maps */}
              <div className="flex flex-row justify-between">
                  <div className="w-2/3 flex flex-col space-y-8">
                    {/* Developers Section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold tracking-wider text-rose-700 uppercase">
                        Developers
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://sanjeevikumarwd.onrender.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-rose-600 transition-colors"
                          >
                            Sanjeevikumar
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://sanjeevikumarwd.onrender.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-rose-600 transition-colors"
                          >
                            Keerthivasan
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold tracking-wider text-rose-700 uppercase">
                        Connect With Us
                      </h3>
                      <div className="flex space-x-4">
                        <a
                          href="https://wa.me/9790177999"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-rose-100 hover:bg-rose-200 transition-colors"
                          aria-label="WhatsApp"
                        >
                          <MessageCircle className="w-6 h-6 text-rose-600" />
                        </a>
                        <a
                          href="https://www.instagram.com/onlybabyindia/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-rose-100 hover:bg-rose-200 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-6 h-6 text-rose-600" />
                        </a>
                        <a
                          href="tel:9790177999"
                          className="p-3 rounded-full bg-rose-100 hover:bg-rose-200 transition-colors"
                          aria-label="Mobile"
                        >
                          <Phone className="w-6 h-6 text-rose-600" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">
                        Follow us for updates and special offers!
                      </p>
                    </div>
                  </div>

                  {/* Map Section */}                
                  <div className="w-1/3 mx-auto">
                    <div className="w-full">
                      {/* Clickable Map Container */}
                      <div className="relative cursor-pointer border rounded-lg overflow-hidden shadow-lg mr-4">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.9194837460423!2d77.7189318!3d11.3405916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f392c2b4f19%3A0xfe7f678b7ebff5d0!2s423%2C%20Brough%20Rd%2C%20Chidambaram%20Colony%2C%20Erode%2C%20Tamil%20Nadu%20638001!5e0!3m2!1sen!2sin!4v1742982016859!5m2!1sen!2sin"
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        {/* Transparent Overlay */}
                        <div
                          className="absolute inset-0"
                          onClick={() => window.open(mapUrl, "_blank")}
                        />
                      </div>
                    </div>
                  </div>
                </div>


          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="py-6 text-center border-t border-rose-100">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} OnlyBaby. All rights reserved.
          </p>
        </div>
      </footer>
    </FadeInOnScroll>
  );
};

export default Footer;
