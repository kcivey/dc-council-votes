# install.packages('devtools')
# devtools::install_github('wmay/dwnominate')
library(dwnominate)
library(pscl)

dat <- readLines("votes-22.fwf")
names = substring(dat, 1, 12)
dat <- substring(dat, 13)
rows <- length(dat)
mat <- matrix(
    NA,
    ncol = nchar(dat[1]),
    nrow = rows
)
for(i in 1:rows){
    mat[i,] <- as.numeric(
        unlist(
            strsplit(dat[i], split = character(0))
        )
    )
}

rc1 <- rollcall(
    mat,
    yea = 1,
    nay = 2,
    missing = c(0, 3, 4, 5, 6, 7, 8),
    notInLegis = 9,
    legis.names = names,
    desc = "DC Council 22"
)
summary(rc1, verbose = TRUE)

dat <- readLines("votes-23.fwf")
names <- substring(dat, 1, 12)
dat <- substring(dat, 13)
rows <- length(dat)
mat <- matrix(
    NA,
    ncol = nchar(dat[1]),
    nrow = rows
)
for(i in 1:rows){
    mat[i,] <- as.numeric(
        unlist(
            strsplit(dat[i], split = character(0))
        )
    )
}

rc2 <- rollcall(
    mat,
    yea = 1,
    nay = 2,
    missing = c(0, 3, 4, 5, 6, 7, 8),
    notInLegis = 9,
    legis.names = names,
    desc = "DC Council 22"
)
summary(rc2, verbose = TRUE)

results <- dwnominate(list(rc1, rc2))
plot(results)
