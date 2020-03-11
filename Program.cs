using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;

namespace Module_6
{
    public static class Program
    {
        public static int[] numbers;
        public static int[] divided;
        //public static string[] linq10times;
        public static string[] linq10timesInOneLine;
        static void DigitsToString() //Распечатать все числа с 10 до 50 через запятую
        {
            CreateNumbersArray();

            var Sorted = from s in numbers
                         where s >= 10 && s <= 50
                         orderby s
                         select s;
            string output = String.Join(", ", Sorted);
            Console.WriteLine(output);
        }
        delegate int Divide(int x);
        static void DivideToThree() //Распечатать числа от 10 до 50 которые делятся целочисленно на 3
        {
            CreateNumbersArray();

            int index = 0;
            divided = new int[101];

            for (int i = 0; i < numbers.Length; i++)
                if (numbers[i] != 0 && numbers[i] % 3 == 0)
                {
                    divided[index] = numbers[i];
                    index++;
                }

            var Sorted = from t in divided
                         where t >= 10 && t <= 50
                         orderby t
                         select t;
            string output = String.Join(", ", Sorted);
            Console.WriteLine(output);
        }
        static void Linq10Times()
        {
            linq10timesInOneLine = new string[9];

            for (int ten = 0; ten < linq10timesInOneLine.Length; ten++)
                linq10timesInOneLine[ten] = "LINQ";

            string output = String.Join(", ", linq10timesInOneLine);
            Console.WriteLine(output);
        }// Вывести слово LINQ 10 раз 
        static void CreateNumbersArray()
        {
            numbers = new int[101];
            int n = 100;

            for (int i = 0; i <= 100; i++)
            {
                numbers[i] = n;
                n--;
            }
        }// Создание  массива numbers
        static void DisplayRowsWithA()//Вывести все строки в которых есть буква 'а'
        {
            string[] stringArrayA = { "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Zaporizhia", "Mykolaiv" };

            var rowsWithA = from rows in stringArrayA
                            where rows.Contains("a")
                            select rows;
            string output = String.Join(", ", rowsWithA);
            Console.WriteLine(output);
        }
        static void RowContainSomeSubstring(string enteredSubstring) //Вывести True или False содержит ли строка подстроку abc
        {
            string[] stringArrayS = { "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Zaporizhia", "Mykolaiv", "Mykolaivka" };

            var rowsContain = (from rows in stringArrayS
                               where rows.Contains(enteredSubstring)
                               select rows).Count();
            Console.WriteLine(rowsContain != 0);
        }
        static void EnterSomeSubstring()// Ввод подстроки юзером
        {
            string enteredSubstring;
            Console.WriteLine("Please enter the row for search");
            enteredSubstring = Console.ReadLine();
            RowContainSomeSubstring(enteredSubstring);
        }
        static void DisplayLongestRow()//Вывести самую длинную строку в последовательности
        {
            string[] stringArrayRow = { "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Zaporizhia", "Mykolaiv", "Mykkolaivka" };
            var longestInt = from ll in stringArrayRow
                             select ll.Length;

            var longestString = from ss in stringArrayRow
                                where ss.Length == longestInt.Max()
                                select ss;

            string output = String.Join(", ", longestString);
            Console.WriteLine(output);
        }
        static void MyTest() //Для тестирования новых методов
        {
            string[] stringArrayT = { "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Zaporizhia", "Mykolaiv", "Mykolaiv" };
            //string[] stringArrayT = null;

            var ddd = stringArrayT.WhereMy(l => l.StartsWith("K"));
            foreach (var d in ddd)
                Console.WriteLine(d);
        }
        public static bool AllMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            foreach (var item in source)
            {
                if (!predicate(item))
                    return false;
            }
            return true;
        }
        public static bool AnyMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            foreach (var item in source)
            {
                if (predicate(item))
                    return true;
                if (predicate(item) == true)
                    break;
            }
            return false;
        }
        public static int CountMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            int count = 0;
            foreach (var item in source)
            {
                if (predicate(item))
                    count++;
            }
            return count;
        }
        public static TSource FirstMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            foreach (var item in source)
            {
                if (predicate(item))
                {
                    obj = item;
                    break;
                }
            }
            if (obj == default)
                Console.WriteLine("The searching row is missing");
            return obj;
        }
        public static TSource FirstOrDefaultMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            if (source != null)
            {
                foreach (var item in source)
                {
                    if (predicate(item))
                    {
                        obj = item;
                        break;
                    }
                }
            }
            return obj;
        }
        public static TSource SingleMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            int count = 0;
            try
            {
                if (source != null)
                {
                    foreach (var item in source)
                    {
                        if (predicate(item))
                        {
                            obj = item;
                            count++;
                        }
                    }
                    if (count > 1)
                    {
                        throw new Exception("Entered row isn't single");
                    }
                }
                if (obj == default)
                    Console.WriteLine("DEFAULT");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return obj;
        }
        public static TSource SingleOrDefaultMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            int count = 0;

            if (source != null)
            {
                foreach (var item in source)
                {
                    if (predicate(item))
                    {
                        obj = item;
                        count++;
                    }
                }
                if (count > 1)
                {
                    obj = default;
                }
            }
            return obj;
        }
        public static TSource LastMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            foreach (var item in source)
            {
                if (predicate(item))
                {
                    obj = item;
                }
            }
            if (obj == default)
                Console.WriteLine("The searching row is missing");
            return obj;
        }
        public static TSource LastOrDefaultMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            TSource obj = default;
            foreach (var item in source)
            {
                if (predicate(item))
                {
                    obj = item;
                }
            }
            if (obj == default)
                Console.WriteLine("DEFAULT");
            return obj;
        }
        public static IEnumerable<TSource> WhereMy<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
        {
            var List = new List<TSource>();

            if (source != null)
            {
                foreach (var item in source)
                {
                    if (predicate(item))
                        List.Add(item);
                }
            }
            return List;
        }
        static void Main(string[] args)
        {
            bool exit = false;
            while (exit == false)
            {
                Console.WriteLine(" -------------------------------------------------------------------------");
                Console.WriteLine(" 1 - To display all numbers from 10 to 50 in the single line");
                Console.WriteLine(" 2 - To display all numbers from 10 to 50 which are integer divisible by 3");
                Console.WriteLine(" 3 - To display the 'LINQ' word 10 times");
                Console.WriteLine(" 4 - To display a cities with 'A' letter");
                Console.WriteLine(" 5 - To display if a row contains entered substring");
                Console.WriteLine(" 6 - To display a longest row");
                Console.WriteLine(" 9 - To run MyTest");
                Console.WriteLine(" 0 - Quit");
                Console.WriteLine(" -------------------------------------------------------------------------");

                string userChoice = Console.ReadLine();
                switch (userChoice)
                {
                    case "1":
                        DigitsToString();
                        break;
                    case "2":
                        DivideToThree();
                        break;
                    case "3":
                        Linq10Times();
                        break;
                    case "4":
                        DisplayRowsWithA();
                        break;
                    case "5":
                        EnterSomeSubstring();
                        break;
                    case "6":
                        DisplayLongestRow();
                        break;
                    case "9":
                        MyTest();
                        break;
                    case "0":
                        exit = true;
                        break;
                }
            }
        }
    }
}
