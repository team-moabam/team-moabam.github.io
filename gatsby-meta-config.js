module.exports = {
  title: `moabam`,
  description: `모아밤의 개발기록`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://team-moabam.github.io`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `team-moabam/team-moabam.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `모아밤`,
    bio: {
      role: `개발팀`,
      description: ['사람에 가치를 두는', '능동적으로 일하는', '이로운 것을 만드는'],
      thumbnail: 'sample.png', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/team-moabam/team-moabam.github.io`,
      linkedIn: ``,
      email: ``,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        date: '2023.10 ~',
        activity: '모아밤 프로젝트 기획 및 개발',
        links: {
          post: '/gatsby-starter-zoomkoding-introduction',
          github: 'https://github.com/orgs/team-moabam/repositories',
          demo: '',
        },
      },
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        title: '모아밤 프로젝트',
        description:
          'BE 개발자와 FE 개발자가 함께하는 프로젝트입니다. 모아밤 프로젝트는 모두의 아침과 밤을 줄인 말로 루틴을 실천하고 싶은 사람들을 모아서 매일 특정 시간을 더 알차게 보낸다는 취지로 기획한 프로젝트입니다.',
        techStack: ['gatsby', 'react'],
        thumbnailUrl: 'blog.png',
        links: {
          post: '/gatsby-starter-zoomkoding-introduction',
          github: 'https://github.com/orgs/team-moabam/repositories',
          demo: '',
        },
      },
    ],
  },
};
