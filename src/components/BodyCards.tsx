import { SimpleGrid } from "@chakra-ui/react";
import CardHome from "./CardHome";

export default function BodyCards() {
    const cardData = [
        {
            title: "The Los Angeles Tour",
            description: "Step into the dazzling world of Hollywood and Beverly Hills on our expertly guided tour. " +
                "Experience movie magic as you visit iconic sites like the legendary Hollywood Sign, " +
                "the Dolby Theatre, home to the Oscars, and the historic Grauman’s Chinese Theatre, where " +
                "countless premieres and the famous Walk of Fame reside. Cruise in style along the Sunset Strip, " +
                "passing landmarks such as the Chateau Marmont, The Viper Room, and The Whiskey a-go-go, birthplaces " +
                "of music legends. Venture into luxurious Beverly Hills, where you might spot celebrities and admire " +
                "opulent hotels like the Beverly Hilton and the timeless Beverly Hills Hotel. Stroll down the renowned " +
                "Rodeo Drive, soaking in the ambiance of this world-famous shopping destination. With advanced " +
                "reservations required, our tour includes smalll snacks, water, and a polished Los Angeles guide " +
                "ensuring an unforgettable journey. Book now and be dazzled by the magic of Tinseltown!",
            originalPrice: "$149.00",
            discountedPrice: "$99.00",
            duration: 3,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "San Francisco Adventure",
            description: "Discover the Golden Gate Bridge, Alcatraz, and the vibrant streets of San Francisco...",
            originalPrice: "$199.00",
            discountedPrice: "$129.00",
            duration: 4,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "New York City Highlights",
            description: "Explore Central Park, Times Square, and the Empire State Building in the heart of NYC...",
            originalPrice: "$249.00",
            discountedPrice: "$149.00",
            duration: 5,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "Miami Beach Experience",
            description: "Relax on the sandy shores and enjoy the vibrant nightlife of Miami Beach...",
            originalPrice: "$299.00",
            discountedPrice: "$199.00",
            duration: 6,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "Miami Beach Experience",
            description: "Relax on the sandy shores and enjoy the vibrant nightlife of Miami Beach...",
            originalPrice: "$299.00",
            discountedPrice: "$199.00",
            duration: 6,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "Miami Beach Experience",
            description: "Relax on the sandy shores and enjoy the vibrant nightlife of Miami Beach...",
            originalPrice: "$299.00",
            discountedPrice: "$199.00",
            duration: 6,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        },
        {
            title: "Miami Beach Experience",
            description: "Relax on the sandy shores and enjoy the vibrant nightlife of Miami Beach...",
            originalPrice: "$299.00",
            discountedPrice: "$199.00",
            duration: 6,
            image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
        }
    ];

    return (
        <SimpleGrid columns={[1, 2, 2]} spacing="40px" padding={"20px"}>
            {cardData.map((data, index) => (
                <CardHome
                    key={index}
                    title={data.title}
                    description={data.description}
                    originalPrice={data.originalPrice}
                    discountedPrice={data.discountedPrice}
                    duration={data.duration}
                    image={data.image}
                />
            ))}
        </SimpleGrid>
    );
}
