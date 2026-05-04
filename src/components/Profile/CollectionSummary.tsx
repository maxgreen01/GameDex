import { Card, HStack, Image, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { CollectionSummary as TCollectionSummary } from "@/types/types.ts";

interface Props {
  summary: TCollectionSummary;
}

function CollectionSummary({ summary }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>
          <ChakraLink asChild>
            <Link to={`/collections/${summary._id}`}>{summary.name}</Link>
          </ChakraLink>
        </Card.Title>
        <Text textStyle="sm">Includes {summary.gameImages.length} games.</Text>
      </Card.Header>
      <Card.Body>
        <HStack overflow="hidden">
          {summary.gameImages.map((gameImage) => (
            <Image
              key={gameImage}
              src={gameImage}
              height="100px"
              aspectRatio={3 / 4}
              rounded="md"
            />
          ))}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

export default CollectionSummary;
