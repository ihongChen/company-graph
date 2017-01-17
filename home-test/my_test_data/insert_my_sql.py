#!encoding:utf8
import pymysql
import csv
conn = pymysql.connect(host='ihongchen.ctbx4pq8or72.us-west-2.rds.amazonaws.com',
                port=3306,user='ehome4829', passwd='a126234829',
                db='test',charset = 'utf8')

cursor=conn.cursor()

#### create tables ######
cursor.execute("""DROP TABLE if exists `公司法人資料`; """)
sql1 = """
        create table 公司法人資料(
        ID char(8),
        公司名稱 varchar(20),
        資產總額 varchar(20)
        );
        """
cursor.execute(sql1)

cursor.execute('DROP TABLE if exists 公司董監事; ')

sql2 = """ create table `公司董監事`(
            `ID` CHAR(8),
             `所代表法人ID` CHAR(8),
             `所代表法人` VARCHAR(20),
             `代表人` CHAR(10),
             `股份數` VARCHAR(20)
            )"""
cursor.execute(sql2)

#### read from company.csv and write to mysqldb (test)###

# ###
def saveCsvTodb(filename,conn,table):
    cursor=conn.cursor()
    with open(filename,newline='\n') as csv_file:
        reader=csv.reader(csv_file,delimiter=',')
        next(reader,None) # skip header
        for row in reader:
            string_index='%s'+',%s'*(len(row)-1)
            sql_insert=""" INSERT INTO {} values({})""".format(table,string_index)
            print(row)
            cursor.execute(sql_insert,row)
    cursor.close()
    conn.commit()
saveCsvTodb('director.csv',conn,'公司董監事')
saveCsvTodb('company.csv',conn,'公司法人資料')

conn.close();
