import thumbnail from '../assets/images/thumbnail-im.jpg'
import post1 from '../assets/images/posts/Post-1.png'
import post2 from '../assets/images/posts/post-2.png'
import post3 from '../assets/images/posts/post-3.png'
import post4 from '../assets/images/posts/post-4.png'
import childrenDay from '../assets/images/posts/post-children-day-2.png'
import childrenDay2 from '../assets/images/posts/post-activity-citizen.png'
import citizenActivity from '../assets/images/posts/post-activity-citizen.png'
import citizenActivity2 from '../assets/images/posts/post-activity-citizen-2.png'
import fireSafety from '../assets/images/posts/post-5-fire-safety.png'
import annualGeneralMeeting1 from '../assets/images/posts/post-annual-general-meeting.png'
import annualGeneralMeeting2 from '../assets/images/posts/post-annual-general-meeting-2.png'


export const companyUpdates = [
          {
            id: '1',
            title: '2024 National Conference/Annual General Meeting',
            content: 'The 2024 National Conference and Annual General Meeting was hosted by YMCA Maala Hills at Lafia, Nasarawa State from 22nd-29th September, 2024. The Theme of this Year\'s Conference is "Equipping Young People for Transformational Leadership in Nigeria". Key Highlights of the event was Youth Conference, Adult Conference, Annual Elections, and Keynote Address. Local Y\'s in different States were represented.',
            postedAt: new Date('2024-09-29T12:00:00'),
            images: [post1, post2, post3], // Multiple images array
          },
          {
            id: '2',
            title: '2024 World Mental Health Day',
            content: 'YMCA of Lagos collaborated with the Council of Church, a unit of the YMCA of Lagos to mark 2024 World Mental Health Day during their Annual Harvest and Thanksgiving Service. Zuriel Olowe, a Mental Health expert spoke on the need to prioritize Self Care for overall well being. She stressed the importance of building healthy relationships, maintaining healthy eating habits. There was also questions and answers sessions. Participants were given a sticker with the message "We need to make Mental Health important as Physical Health".',
        
            postedAt: new Date('2024-10-10T14:30:00'),
            images: [post2, post4], // Multiple images array
          },
          {
            id: '3',
            title: '2024 Annual General Meeting - YMCA Lagos',
            content: 'The 2024 Annual General Meeting of the YMCA of Lagos held on Saturday 29th June 2024. The Guest speaker: Professor Olurotimi Coker facilitated the keynote Address on the theme: "The Joy and Benefits of Social Health, Wellbeing, and Networking." The session was quite educative. Members had the opportunity to review and deliberate on the organization\'s activities for the year 2023 while looking forward for more impactful years ahead.',
           postedAt: new Date('2024-06-29T10:00:00'),
            imageUrl: annualGeneralMeeting2, 
          },
          {
            id: '4',
            title: '2024 Children\'s Day Celebrations',
            content: 'Celebrating Children\'s Day in style at YMCA Lagos! 🎉✨ We had an amazing time hosting a special party for the bright young stars from public primary schools across Surulere, Lagos. From games and activities to delicious treats, every moment was filled with joy and laughter. Here\'s to nurturing the future generation and creating unforgettable memories together!',
            postedAt: new Date('2024-05-27T09:00:00'),
            images: [childrenDay, childrenDay2, thumbnail], 
          },
          {
            id: '5',
            title: '2024 Active Citizens Training',
            content: 'YMCA of Lagos organized comprehensive Active Citizens Training sessions focused on empowering young people with leadership skills and civic engagement. The training covered various aspects of community development, social responsibility, and active participation in democratic processes.',
           postedAt: new Date('2024-04-15T11:00:00'),
            imageUrl: [citizenActivity,citizenActivity2], 
          },
          {
            id: '6',
            title: 'Fire Safety and CPR Training Program',
            content: 'YMCA of Lagos Central Club hosted an informative session on Fire Safety and CPR for Junior Secondary students within Ikoyi-Obalende LGA. Held on March 7th, 2024, the participants were equipped with life-saving skills. It was an opportunity to learn how to prepare for emergencies and handle fire extinguishers properly.',
             postedAt: new Date('2024-03-07T13:30:00'),
            images: [fireSafety, post2],
            attachments: [
              {
                name: 'Fire Safety Guidelines',
                url: '#',
                type: 'pdf'
              },
            ]
          },
          {
            id: '7',
            title: '2024 YMCA of Lagos Youth Council Annual General Meeting',
            content: 'The 2024 Annual General Meeting (AGM) of the YMCA of Lagos Youth Council held on Saturday 25th of February 2024 was a resounding success! From reflecting on past achievements to setting ambitious goals for the future, the AGM was a true testament to the passion and commitment of our youth community.',
            postedAt: new Date('2024-02-25T14:00:00'),
            imageUrl: annualGeneralMeeting1, // Single image support maintained
          }
]


export const carouselImagesL = [
    {
      id: '1',
      url: post1, // Replace with actual company images
      title: 'YMCA Community Center',
      description: 'Our main facility serving the community'
    },
    {
      id: '2',
      url: post2, // Replace with actual company images
      title: 'Youth Programs',
      description: 'Empowering young minds through various activities'
    },
    {
      id: '3',
      url: post3, // Replace with actual company images
      title: 'Sports Facilities',
      description: 'Modern facilities for health and wellness'
    },
    {
      id: '4',
      url: post4, // Replace with actual company images
      title: 'Educational Programs',
      description: 'Learning opportunities for all ages'
    },
    // {
    //   id: '5',
    //   url: thumbnail, // Replace with actual company images
    //   title: 'Community Events',
    //   description: 'Bringing people together through shared experiences'
    // }
]