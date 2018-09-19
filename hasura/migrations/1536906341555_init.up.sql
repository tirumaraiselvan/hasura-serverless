--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5 (Ubuntu 10.5-1.pgdg14.04+1)
-- Dumped by pg_dump version 10.5 (Ubuntu 10.5-0ubuntu0.18.04)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

--
-- Name: agent_assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_assignment (
    order_id uuid NOT NULL,
    agent_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_assigned boolean DEFAULT false NOT NULL
);


--
-- Name: item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL
);


--
-- Name: order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."order" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_name text NOT NULL
);


--
-- Name: number_order; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order AS
 SELECT count(*) AS count
   FROM public."order";


--
-- Name: number_order_agent_assigned; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_agent_assigned AS
 SELECT count(*) AS count
   FROM public.agent_assignment;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment (
    order_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_success boolean DEFAULT false NOT NULL
);


--
-- Name: number_order_payment_valid; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_payment_valid AS
 SELECT count(*) AS count
   FROM public.payment;


--
-- Name: restaurant_approval; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant_approval (
    order_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_approved boolean DEFAULT false NOT NULL
);


--
-- Name: number_order_restaurant_approved; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_restaurant_approved AS
 SELECT count(*) AS count
   FROM public.restaurant_approval;


--
-- Name: order_validation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_validation (
    order_id uuid NOT NULL,
    is_validated boolean DEFAULT false NOT NULL,
    validated_at timestamp with time zone DEFAULT now() NOT NULL,
    reason text
);


--
-- Name: number_order_validated; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_validated AS
 SELECT count(*) AS count
   FROM public.order_validation;


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item (
    order_id uuid NOT NULL,
    item_id uuid NOT NULL
);


--
-- Name: agent_assignment agent_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_assignment
    ADD CONSTRAINT agent_assignment_pkey PRIMARY KEY (order_id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (order_id, item_id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: order_validation order_validation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_validation
    ADD CONSTRAINT order_validation_pkey PRIMARY KEY (order_id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (order_id);


--
-- Name: restaurant_approval restaurant_approval_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_approval
    ADD CONSTRAINT restaurant_approval_pkey PRIMARY KEY (order_id);


--
-- Name: agent_assignment agent_assignment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_assignment
    ADD CONSTRAINT agent_assignment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);


--
-- Name: order_validation order_validation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_validation
    ADD CONSTRAINT order_validation_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);


--
-- Name: payment payment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);


--
-- Name: restaurant_approval restaurant_approval_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_approval
    ADD CONSTRAINT restaurant_approval_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id);


--
-- PostgreSQL database dump complete
--

