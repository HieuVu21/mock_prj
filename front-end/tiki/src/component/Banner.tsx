import React, { useState, useEffect } from 'react';

const bannerSlides = [
  ['/banners/banner1.jpg.webp', '/banners/banner2.jpg.webp'],
  ['/banners/banner3.jpeg.webp', '/banners/banner4.png.webp'],
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mb-6 bg-white p-4 rounded-lg shadow-sm">
      {/* Container cho ảnh banner */}
      <div className="relative w-full overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {bannerSlides.map((slide, slideIndex) => (
            <div key={slideIndex} className="min-w-full flex gap-4">
              {slide.map((banner, bannerIndex) => (
                <div key={bannerIndex} className="w-1/2">
                  <img
                    src={banner}
                    alt={`Banner ${slideIndex * 2 + bannerIndex + 1}`}
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation lines */}
      <div className="flex justify-center mt-4 gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            className={`w-8 h-1 rounded transition-colors ${
              currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;