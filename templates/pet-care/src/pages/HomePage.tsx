import React from 'react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { DogIcon, CatIcon, BirdIcon, HeartPawIcon, BoneIcon, PetHouseIcon } from '../components/PetIcons';
import { PawIcon } from '../components/PawPrintDecoration';

const HomePage: React.FC = () => {
  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 animate-bounce-soft">
            <PawIcon className="w-12 h-12 text-primary" />
            <HeartPawIcon className="w-10 h-10 text-secondary" />
            <PawIcon className="w-12 h-12 text-accent" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Everything Your Pet Needs,
            <span className="text-primary block mt-2">All in One Place</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Quality products and caring services for dogs, cats, and all your furry friends.
            Because they deserve the best!
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
              Shop Now
            </button>
            <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
              Book Services
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Shop by Pet Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Dogs */}
          <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-2 border-primary/20 cursor-pointer group">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-6 rounded-3xl group-hover:animate-wiggle">
                <DogIcon className="text-primary" size={64} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">For Dogs</h3>
            <p className="text-muted-foreground text-center">
              Food, toys, accessories, and grooming supplies for your loyal companion
            </p>
          </div>

          {/* Cats */}
          <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-2 border-secondary/20 cursor-pointer group">
            <div className="flex justify-center mb-6">
              <div className="bg-secondary/10 p-6 rounded-3xl group-hover:animate-wiggle">
                <CatIcon className="text-secondary" size={64} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">For Cats</h3>
            <p className="text-muted-foreground text-center">
              Treats, toys, litter, and care products for your independent feline
            </p>
          </div>

          {/* Other Pets */}
          <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-2 border-accent/20 cursor-pointer group">
            <div className="flex justify-center mb-6">
              <div className="bg-accent/10 p-6 rounded-3xl group-hover:animate-wiggle">
                <BirdIcon className="text-accent" size={64} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Other Pets</h3>
            <p className="text-muted-foreground text-center">
              Supplies for birds, fish, hamsters, rabbits, and more
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Pet Parents Love Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-4">
                <HeartPawIcon className="text-primary" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-muted-foreground">
                Carefully selected items that meet the highest standards for pet health and happiness
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-3xl mb-4">
                <BoneIcon className="text-secondary" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Advice</h3>
              <p className="text-muted-foreground">
                Our team of pet care specialists is here to help you make the best choices
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-3xl mb-4">
                <PetHouseIcon className="text-accent" size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Get your pet supplies delivered quickly, so they never run out of their favorites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make Your Pet Happy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of pet parents who trust us with their furry friends
          </p>
          <button className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
            Start Shopping
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
