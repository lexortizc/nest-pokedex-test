import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // Delete * from Pokemon
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    // const insertPromisesArray = [];
    const pokemonsToInsert: { no: number; name: string }[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      // insertPromisesArray.push(this.pokemonModel.create({ no, name }));
      pokemonsToInsert.push({ no, name });
    });

    // const result = await Promise.all(insertPromisesArray);
    // await Promise.all(insertPromisesArray);
    await this.pokemonModel.insertMany(pokemonsToInsert);

    return data.results;
  }
}
