import Logo from '../../assets/images/Logo.svg';

export default function OurStory({ data }) {
  if (!data) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#5B167A] to-[#8A2BE2] mt-10 md:mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[121px] py-10 sm:py-12 md:py-16 lg:py-[80px] relative flex flex-col md:flex-row items-center md:items-center min-h-[280px] md:min-h-0">

        {/* Left Content */}
        <div className="w-full md:w-1/2 text-white flex flex-col gap-3 md:gap-4 text-center md:text-left z-10">
          <span className="text-xs md:text-sm opacity-80 text-[#FFEED8]">Our Story</span>
          <h2 className="text-2xl sm:text-3xl font-olivera">
            THE SAKHI JEWELS
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed max-w-[420px] mx-auto md:mx-0">
            {data.description}
          </p>
          <button className="mt-2 md:mt-4 w-[120px] h-[36px] bg-white text-[#5B167A] rounded-md text-sm font-medium mx-auto md:mx-0">
            Know More
          </button>
        </div>

        {/* Right Image - hidden on very small, visible from sm */}
        <div className="absolute right-0 bottom-0 h-full flex items-end pointer-events-none opacity-60 md:opacity-100">
          <img
            src={Logo}
            alt="Our Story"
            className="h-[140px] sm:h-[200px] md:h-[300px] object-contain"
          />
        </div>

      </div>
    </div>
  );
}
