import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Book, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  const scrollToIntroduction = () => {
    const introSection = document.getElementById('introduction');
    introSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: Book, number: '9', label: 'Di tích quan trọng' },
    { icon: Users, number: '50+', label: 'Năm hoạt động cách mạng' },
    { icon: Heart, number: '1M+', label: 'Lượt tham quan' },
    { icon: Star, number: '100%', label: 'Chính xác lịch sử' }
  ];

  return (
    <section id="overview" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-900 pt-16 lg:pt-20">
      {/* Vietnam Flag & Party Flag Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Multiple Flying Vietnam Flags */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`vn-flag-${i}`}
            className="absolute"
            initial={{
              x: -120,
              y: Math.random() * (window.innerHeight * 0.8),
              rotate: Math.random() * 20 - 10
            }}
            animate={{
              x: window.innerWidth + 120,
              y: Math.random() * (window.innerHeight * 0.6) + 100,
              rotate: Math.random() * 20 - 10
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 4,
              ease: "easeInOut"
            }}
          >
            {/* Vietnam Flag - Red with Yellow Star */}
            <div className="w-24 h-16 bg-red-600 relative shadow-xl opacity-25 hover:opacity-40 transition-opacity duration-300 rounded-sm">
              {/* Yellow Star */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              </div>
              {/* Flag wave effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform skew-x-6 opacity-60"></div>
            </div>
          </motion.div>
        ))}

        {/* Multiple Flying Party Flags */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`party-flag-${i}`}
            className="absolute"
            initial={{
              x: window.innerWidth + 120,
              y: Math.random() * (window.innerHeight * 0.8),
              rotate: Math.random() * 20 - 10
            }}
            animate={{
              x: -120,
              y: Math.random() * (window.innerHeight * 0.6) + 100,
              rotate: Math.random() * 20 - 10
            }}
            transition={{
              duration: 16 + i * 2,
              repeat: Infinity,
              delay: i * 4 + 2,
              ease: "easeInOut"
            }}
          >
            {/* Party Flag - Red background with Hammer & Sickle */}
            <div className="w-24 h-16 bg-red-700 relative shadow-xl opacity-25 hover:opacity-40 transition-opacity duration-300 rounded-sm">
              {/* Official Communist Party Vietnam hammer and sickle from Wikipedia */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-7 h-7 text-yellow-400">
                  <svg viewBox="0 0 238.125 158.75" fill="currentColor" className="w-full h-full">
                    <g transform="scale(0.3) translate(50, 30)">
                      {/* Sickle */}
                      <path d="m 193.653452628385,47.176950096642 c 6.38779271804,7.230641357446 14.963163305737,12.502793149194 24.298667889062,14.938860558647 6.056211101325,1.5803471957 12.472708435771,1.978650572228 18.596462444365,0.684499497231 6.123754008594,-1.294151074997 11.937748010956,-4.335579482059 16.158102214692,-8.957678632632 4.574893298958,-5.010387614465 7.112965317221,-11.701447693132 7.640977625143,-18.465679781602 0.528012307931,-6.76423208847 -0.871424851367,-13.593465851735 -3.428046439768,-19.878155088105 -4.560331599745,-11.210210791164 -12.883741385267,-20.851111282196 -23.308680635365,-26.998150562502 8.512796781266,0.709574410866 16.805946699762,3.8827694509 23.618107102883,9.036959544979 6.812160403116,5.154190094079 12.120611342006,12.272184963572 15.117966521428,20.271376598489 2.997355179421,7.999191634919 3.673617806543,16.852901094338 1.925932041966,25.214527691603 -1.747685764577,8.361626597266 -5.913491031185,16.203282596691 -11.863819649182,22.332295096395 -8.683007967653,8.943752149713 -21.180068232394,14.055514292711 -33.64194922505,13.760807647735 -12.461880992656,-0.294706644979 -24.703333498127,-5.991501184333 -32.953855939355,-15.335708444904 l -14.556480332948,14.556690177998 -9.381909223252,-9.381909223192 z" />
                      {/* Hammer */}
                      <path d="m 237.425255409582,6.753831581282 -10.959354263905,10.959354263781 49.262553323164,49.262553323191 -11.130862671953,11.240941835746 -49.317592904992,-49.317592905071 -8.654444010462,8.654444010525 -12.790755991701,-12.790755991717 21.572665110517,-21.572665110577 c 2.680889538451,0.275819129839 5.402702461607,0.150469066643 8.046892630834,-0.370590679184 2.581477478967,-0.508701686704 5.088366413035,-1.394314604689 7.416535436053,-2.62005208911 z" />
                    </g>
                  </svg>
                </div>
              </div>
              {/* Flag wave effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-6 opacity-60"></div>
            </div>
          </motion.div>
        ))}

        {/* Decorative Star Elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              rotate: 0
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: 360,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          >
            <Star className="w-3 h-3 text-yellow-400 opacity-15" fill="currentColor" />
          </motion.div>
        ))}

        {/* Traditional Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-yellow-400 rotate-45 animate-pulse opacity-8"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-yellow-400 rotate-12 animate-pulse delay-1000 opacity-8"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border-2 border-yellow-400 rotate-45 animate-pulse delay-500 opacity-8"></div>
      </div>      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Tổng quan dự án
              <span className="block text-yellow-400 mt-2">Di sản Hồ Chí Minh</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Khám phá hành trình cách mạng của Chủ tịch Hồ Chí Minh qua các di tích lịch sử quan trọng,
            kết hợp công nghệ hiện đại để mang đến trải nghiệm học tập sống động và ý nghĩa.
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-4">
                  <stat.icon className="w-6 h-6 text-red-800" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</h3>
                <p className="text-gray-200 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToIntroduction}
            className="group bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-2xl hover:shadow-yellow-400/20 inline-flex items-center gap-3"
          >
            Khám phá ngay
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
