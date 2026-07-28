import React from "react";
import { Card, Button, Section } from "../components/ui";
import {
  GoalCard,
  WaterCard,
  WeightCard,
  CaloriesCard,
  DailyProgress,
} from "../components/dashboard";
import { MealCard, MealGrid } from "../components/meal";

export default function Home() {
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:24}}>
      <h1>Buongiorno 👋</h1>
      <p style={{color:"#6B746D"}}>Bentornata su AC UP</p>

      <DailyProgress value={65} />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginTop:24}}>
        <GoalCard current={98} target={75}/>
        <WaterCard current={6} target={8}/>
        <CaloriesCard current={1450} target={1900}/>
        <WeightCard weight={98} delta="-0.8 kg questa settimana"/>
      </div>

      <Section title="Pasti di oggi">
        <MealGrid>
          <MealCard title="Colazione" calories={320} protein={22} carbs={30} fat={10}/>
          <MealCard title="Pranzo" calories={640} protein={42} carbs={65} fat={18}/>
          <MealCard title="Cena" calories={560} protein={38} carbs={40} fat={20}/>
        </MealGrid>
      </Section>

      <div style={{marginTop:24}}>
        <Button>Aggiungi peso</Button>
      </div>
    </div>
  );
}
