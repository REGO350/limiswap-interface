import React from "react";
import { Button, Card } from "react-bootstrap";
import { IRawOrder } from "./StatsInterface";

interface IProps {
  key: string;
  rawOrder: IRawOrder;
}

const Order: React.FC<IProps> = ({ rawOrder }) => {

  

  return (
    <Card
      bg="secondary"
    >
      <Card.Header>Featured</Card.Header>
      <Card.Body>
        <Card.Title>Special title treatment</Card.Title>
        <Card.Text>
          With supporting text below as a natural lead-in to additional content.
        </Card.Text>
        <Button variant="primary">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
};

export default Order;
