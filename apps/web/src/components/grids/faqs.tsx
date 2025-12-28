import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "../ui/accordion";
import { nanoid } from "nanoid";

export function FaqsGridHome() {
  const questions = [
    {
      trigger: "What is morpics?",
      panel:
        "Morpics is a URL-powered image manipulation service that lets you generate optimized images on the fly using simple, declarative URLs or our type-safe SDK.",
    },
    {
      trigger: "Who should use morpics?",
      panel:
        "Developers who need to manage and deliver optimized images without building their own image processing infrastructure.",
    },
    {
      trigger: "Why choose morpics?",
      panel:
        "It offers a developer-friendly experience with a type-safe SDK, essential image transformations (resize, blur, format), and seamless integration for modern web apps.",
    },
    {
      trigger: "Is there a way to use morpics as API only",
      panel:
        "For the time being, morpics is designed to be used as a complete solution with both the API and dashboard. We may consider an API-only option in the future based on user feedback.",
    },
  ];
  return (
    <Accordion
      indicator="plus"
      variant={"outline"}
      className="w-full bg-background p-4"
    >
      {questions.map((q, index) => (
        <AccordionItem
          key={nanoid()}
          value={`faq-${index}`}
          className={
            "data-open:bg-muted transition-all duration-150 ease-in-out"
          }
        >
          <AccordionHeader>
            <AccordionTrigger>{q.trigger}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className={"text-muted-foreground"}>
            {q.panel}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FaqsGridPrice() {
  const questions = [
    {
      trigger: "Can I change my plan later?",
      panel:
        "Yes, you can upgrade or downgrade your plan at any time from your account settings.",
    },
    {
      trigger: "Is there a free trial available?",
      panel: "No. we do not offer a free trial at this time.",
    },
    {
      trigger: "What payment methods are accepted?",
      panel:
        "We accept all major credit cards, UPI(India only), including Visa, MasterCard, American Express, and Discover.",
    },
  ];
  return (
    <Accordion
      indicator="plus"
      variant={"outline"}
      className="w-full bg-background p-4"
    >
      {questions.map((q, index) => (
        <AccordionItem
          key={nanoid()}
          value={`faq-${index}`}
          className={
            "data-open:bg-muted transition-all duration-150 ease-in-out"
          }
        >
          <AccordionHeader>
            <AccordionTrigger>{q.trigger}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className={"text-muted-foreground"}>
            {q.panel}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
