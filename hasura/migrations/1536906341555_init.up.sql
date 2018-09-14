--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Ubuntu 10.4-2.pgdg14.04+1)
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

--
-- Name: assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment (
    order_id text NOT NULL,
    driver_id integer NOT NULL
);


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id integer NOT NULL,
    order_id text NOT NULL,
    item text NOT NULL
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    name text NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    order_id text NOT NULL,
    user_id text NOT NULL,
    restaurant_id integer NOT NULL,
    address text NOT NULL,
    placed boolean DEFAULT false NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    driver_assigned boolean DEFAULT false NOT NULL,
    food_picked boolean DEFAULT false NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    order_valid boolean DEFAULT false,
    payment_valid boolean,
    created timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: number_order_approved; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_approved AS
 SELECT count(*) AS count
   FROM public.orders
  WHERE (orders.approved = true);


--
-- Name: number_order_driver_assigned; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_driver_assigned AS
 SELECT count(*) AS count
   FROM public.orders
  WHERE (orders.driver_assigned = true);


--
-- Name: number_order_payment_valid; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_payment_valid AS
 SELECT count(*) AS count
   FROM public.orders
  WHERE (orders.payment_valid = true);


--
-- Name: number_order_validated; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_order_validated AS
 SELECT count(*) AS count
   FROM public.orders
  WHERE (orders.order_valid = true);


--
-- Name: number_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.number_orders AS
 SELECT count(*) AS count
   FROM public.orders;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id text NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: assignment assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (order_id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (name);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: assignment assignment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: items items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- PostgreSQL database dump complete
--

