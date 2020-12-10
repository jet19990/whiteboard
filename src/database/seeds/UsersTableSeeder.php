<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'name' => 'Jason',
            'email' => 'Jason1@gmail.com',
            'canEdit'=> true,
            'password' => bcrypt('Pass12345'),
        ]);
        DB::table('users')->insert([
            'name' => 'Darry',
            'email' => 'Darry127@gmail.com',
            'password' => bcrypt('Pass12345'),
        ]);
        DB::table('users')->insert([
            'name' => 'Fernando',
            'canEdit'=> true,
            'email' => 'Fernando@gmail.com',
            'password' => bcrypt('Pass12345'),
        ]);

        
    }
}
