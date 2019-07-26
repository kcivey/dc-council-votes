#!/usr/bin/env Rscript

# install.packages('devtools')
# devtools::install_github('wmay/dwnominate')
library(dwnominate)
library(pscl)

rcList <- list()

for (councilPeriod in 22:23) {
    dat <- readLines(paste("votes-", councilPeriod, ".fwf", sep = ""))
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
    rc <- rollcall(
        mat,
        yea = 1,
        nay = 2,
        missing = c(0, 3, 4, 5, 6, 7, 8),
        notInLegis = 9,
        legis.names = names,
        desc = paste("DC Council", councilPeriod)
    )
    summary(rc, verbose = TRUE)
    rcList <- append(rcList, rc)
}

results <- dwnominate(rcList)
plot(results)
